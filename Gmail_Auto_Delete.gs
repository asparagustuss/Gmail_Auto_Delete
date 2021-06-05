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

//Requires Gmail Service installed to project
//==================OPTIONS==================//
// Only delete emails older than X days (0 includes EVERYTHING/All emails reguardless of when received)
var DELETE_AFTER_DAYS = 365;
// If true, any email with an assigned Yellow Star is NOT deleted.
var SKIP_ASSIGNED_YELLOW_STAR = true;
// If true, any email assigned Important is NOT deleted. *Important emails are auto flagged by a gmail algorithm. Chances are these emails are not in fact important to you. 
var SKIP_ASSIGNED_IMPORTANT = false;
// If true, any email with a user made custom label is NOT deleted.
var SKIP_ASSIGNED_USER_MADE_LABELS = true;
// Emails received from these specific addresses will never be deleted reguardless of any settings above
var SKIP_FROM_LIST = [
  "email_1@gmail.com",
  "email_2@gmail.com",
  "email_3@gmail.com",
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

function executeFilterDelete(ev) {
  deleteAllTriggers()
  ScriptApp.newTrigger("executeFilterDelete").timeBased().everyDays(1).create(); // nightly created now incase of unmoniotored error. Having multiple time triggers seems to create issues.
  var errorFlag = 0;
  var olderThanDate = new Date();  
  olderThanDate.setDate(olderThanDate.getDate() - DELETE_AFTER_DAYS);    
  var search = generate_search()
  try {
    var totalThreads = 0
    var threads = GmailApp.search(search, 0, PAGE_SIZE);
    console.log("Processing " + threads.length + " emails.");
    while(threads.length > 0){
      for (var i=0; i<threads.length; i++) {
        var thread = threads[i];
        //confirm its old enough just incase gmail filter is being wierd.
        if (thread.getLastMessageDate() <= olderThanDate) {
          thread.moveToTrash();
        } else {console.log("Error Date: " + thread.getLastMessageDate())}
      }
      totalThreads = totalThreads + threads.length
      console.log("Processing " + threads.length + " more emails. Total Emails Deleted:" + totalThreads);
      threads = GmailApp.search(search, 0, PAGE_SIZE);
      if (totalThreads >= 1000) {   //1200-1400 exceeds 4-5mins and script will be force ended by server
        break
      }
    }
    console.log("done")
  } catch (e) {
      console.log("error!:" + e);
      errorFlag = 1;
    }
    //if more to delete exist and no errors have been flagged delete nightly and create a new one shot trigger in 60 seconds
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
function generate_Search(){ 
  var labelLists = Gmail.Users.Labels.list('me');
  var olderThanClause = "";
  var yellowStarClause = "";
  var importantClause = "";
  var userLabelClause = "";
  var skipFromClause = "";
  if(DELETE_AFTER_DAYS >0){olderThanClause = "older_than:" + DELETE_AFTER_DAYS + "d"}
  if(SKIP_ASSIGNED_YELLOW_STAR == true){yellowStarClause =" -has:yellow-star"}
  if(SKIP_ASSIGNED_IMPORTANT == true){importantClause= " -is:important"}
  if(SKIP_ASSIGNED_USER_MADE_LABELS == true){
    //populate userLabels
    
    if (labelLists.labels.length == 0) {
      Logger.log('No labels found.');
    } else {
      //Logger.log('Labels:');
      for (var i = 0; i < labelLists.labels.length; i++) {
        var label = labelLists.labels[i];
        if(label.type == 'user'){
          //Logger.log('LabelName: %s | LabelType: %s', label.name, label.type);
          userLabelClause =  userLabelClause + " -label:\"" + label.name + "\"";
        }
      }
    }
  }
  if(SKIP_FROM_LIST != null){skipFromClause = " from:(-" + SKIP_FROM_LIST.join(",-") + ")"}
  var search = olderThanClause + yellowStarClause + importantClause + userLabelClause + skipFromClause;
  search = search.trim();
  console.log("Search Term: " + search);
  //var threads = GmailApp.search(search, 0, PAGE_SIZE);
  //console.log("Total Results Found: " + threads.length);
  return search
}
