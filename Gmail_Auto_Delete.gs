/**
Copyright (C) 2021 Sean Stumpf

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
//=================Disclaimer================//
//This scrip permenatly deletes emails. They will be lost forever. 
//Please review your settings and test them by copying the 
//log output from the 'generate search' function and testing in Gmail directly. 
//That said, I have had no issues.
//As stated in the license, use at your own risk.
//==================OPTIONS==================//
//---Any combination below can be combined---//
// Only delete emails older than X days (0 includes EVERYTHING/All emails reguardless of when received)
var DELETE_AFTER_DAYS = 365;
// Only delete emails that are at least X MB (0 includes EVERYTHING/All emails reguardless of size)
var MESSAGE_MB_MINIMUM = 1;
// If true, only email with an attachement will be deleted.
var HAS_ATTACHMENT = false
// Only emails containg the listed file types will be deleted.
var CONTAINS_FILE_TYPES = [
  //"pdf",
  //"txt",
  //"zip",
  //"avi",
  //"mpeg",
  //"mp4",
  //"mp3",
  //"jpeg",
  //"jpg"
];
// If true, any email that is been starred will NOT deleted.
var SKIP_STARRED = true;
// If true, any email that is snoozed will NOT deleted.
var SKIP_SNOOZED = false;
// If true, any email that is unread will NOT deleted.
var SKIP_UNREAD = false;
// If true, any email assigned Important is NOT deleted. *Important emails are auto flagged by a gmail algorithm. Chances are these emails are not in fact important to you. 
var SKIP_IMPORTANT = false;
// If true, any email with a user made custom label is NOT deleted.
var SKIP_USER_MADE_LABELS = true;
// Emails received from these specific addresses will never be deleted reguardless of any settings above
var SKIP_FROM_LIST = [
  "email_1@gmail.com",
  "email_2@gmail.com",
  "@something.com",
];
// Emails received from these specific categories will never be deleted reguardless of any settings above
var SKIP_CATEGORY_LIST = [
  //"primary",
  //"social",
  //"promotions",
  //"updates",
  //"forums",
  //"reservations",
  //"purchases"
];
//================================================

// This does not need to be changed! Number of search returns (threads), Max 500 per search any higher will break script. 
var PAGE_SIZE = 200;

//load script
function startup() {
  ScriptApp.newTrigger("executeFilterDelete")
    .timeBased()
    .at(new Date((new Date()).getTime() + 60000))
    .create();     
   return;
}

//delete all triggers
function deleteAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i=0; i<triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

function executeFilterDelete() {
  deleteAllTriggers()
  ScriptApp.newTrigger("executeFilterDelete").timeBased().everyDays(1).create(); // nightly created now incase of unmoniotored error. Having multiple time triggers seems to create issues.
  var errorFlag = 0;
  var olderThanDate = new Date();  
  olderThanDate.setDate(olderThanDate.getDate() - DELETE_AFTER_DAYS +1);    
  var search = generate_search()
  try {
    var totalProcessedThreads = 0
    var threads = GmailApp.search(search, 0, PAGE_SIZE);
    console.log("Processing " + threads.length + " emails.");
    while(threads.length > 0){
      for (var a=0; a < threads.length; a++) {
        if (threads[a].getLastMessageDate() < olderThanDate) {
          threads[a].moveToTrash();
        } else {
          var messages = GmailApp.getMessagesForThread(threads[a]);
          for (var j=0; b < messages.length; b++) {      
            if (messages[b].getDate() < DELETE_AFTER_DAYS) {
              messages[b].moveToTrash();
            }
          }
        }
      }
      totalProcessedThreads = totalProcessedThreads + threads.length
      threads = GmailApp.search(search, 0, PAGE_SIZE);
      console.log("Processing " + threads.length + " more emails. Total Emails Deleted:" + totalProcessedThreads);
      if (totalProcessedThreads >= 1000) {   //1200-1400 exceeds 4-5mins and script will be force ended by server
        break;
      }
    }
    console.log("done")
  } catch (e) {
      console.log("error!:" + e);
      errorFlag = 1;
    }
    //if more to delete exist and no errors have been flagged, delete nightly and create a new one shot trigger in 60 seconds
  threads = GmailApp.search(search, 0, PAGE_SIZE);
  if (threads.length > 0 & errorFlag == 0){
    deleteAllTriggers()
    ScriptApp.newTrigger("executeFilterDelete")
      .timeBased()
      .at(new Date((new Date()).getTime() + 60000))
      .create();
  }
}

//Generate gmail search statement. Log can be used to test in gmail search bar directly.
function generate_search(){ 
  var olderThanClause = "";
  var sizeClause = "";
  var hasAttachmentClause = "";
  var containsFileTypesClause = "";
  var skipStarClause = "";
  var skipSnoozedClause = "";
  var skipUnreadClause = "";
  var skipimportantClause = "";
  var skipuserLabelClause = "";
  var skipFromClause = "";
  var skipCategoryClause = "";
  if(DELETE_AFTER_DAYS >0){olderThanClause = "older_than:" + DELETE_AFTER_DAYS + "d"}
  if(MESSAGE_MB_MINIMUM>0){sizeClause = " larger:" + MESSAGE_MB_MINIMUM + "M"}
  if(HAS_ATTACHMENT == true){hasAttachmentClause = " has:attachment"}
  if(CONTAINS_FILE_TYPES.length > 0){containsFileTypesClause = " filename:(" + CONTAINS_FILE_TYPES.join(",-") + ")"}
  if(SKIP_STARRED == true){skipStarClause =" -is:starred"}
  if(SKIP_SNOOZED == true){skipSnoozedClause = " -is:snoozed"}
  if(SKIP_UNREAD == true) {skipUnreadClause = " -is:unread"}
  if(SKIP_IMPORTANT == true){skipimportantClause= " -is:important"}
  if(SKIP_USER_MADE_LABELS == true){skipuserLabelClause = " has:nouserlabels"}
  if(SKIP_FROM_LIST.length > 0){skipFromClause = " from:(-" + SKIP_FROM_LIST.join(",-") + ")"}
  if(SKIP_CATEGORY_LIST.length > 0){skipCategoryClause = " category:(-" + SKIP_CATEGORY_LIST.join(",-") + ")"}
  var search = olderThanClause + sizeClause + hasAttachmentClause + containsFileTypesClause + skipStarClause + skipSnoozedClause + skipUnreadClause + skipimportantClause + skipuserLabelClause + skipFromClause + skipCategoryClause;
  search = search.trim();
  console.log("Search Term: " + search);
  // var threads = GmailApp.search(search, 0, PAGE_SIZE);
  // console.log("Total Results Found: " + threads.length);
  return search
}
