# Gmail_Auto_Delete
Google Apps Script that auto deletes emails nightly based on options: Age, Size, Has Attachments, File Types, Starred, Important, User Labels, Cats, From, Unread, Snoozed, etc..

**About:**

With drive capacity now being a thing for Google services this seems really useful to me. The script works by deleting in blocks of 200 up 1000 per tiggered instance. After 1000 emails have been deleted if there are more remaining it will start another trigger in 60 seconds. If no emails are left to delete then the nightly trigger is created. It looks like about 3000-4000 emails is the most that can be deleted in a day. Based on how many excess emails you have this could take a week or more.

When reviewing the code the trigger creation and deletion method may seem odd, but Google seems to be limiting how triggers can be run and how many can be run consecutively. If too many triggers are run one after another then it will just cancel all triggers for the project--even a nightly. The method employed here ensures that reguardless of what shenanigans Google is using on the server side to stop triggers this code will always rerun nightly. 


**How to Deploy:**
- Copy and paste the code into the an new .gs file on https://script.google.com/.
- Set your options with the scripts constants (explained below)
- Start the 'startup' function. 
- Done!

**if you want to test the deletion results before deploying setup your options and run the 'generate_search' function. Copy the log search output and paste into Gmail. The Gmail results shown are the exact results that will be used by the script for deletion.*

**Options Explained:**
- DELETE_AFTER_DAYS: Only delete emails older than X days (0 includes EVERYTHING/All emails reguardless of when received)
- MESSAGE_MB_MINIMUM: Only delete emails that are at least X MB (0 includes EVERYTHING/All emails reguardless of size)
- HAS_ATTACHMENT: If true, only email with an attachement will be deleted.
- CONTAINS_FILE_TYPES: Only emails containg the listed file types will be deleted.
- SKIP_STARRED: If true, any email that is been starred will NOT be deleted.
- SKIP_SNOOZED: If true, any email that is snoozed will NOT be deleted.
- SKIP_UNREAD: If true, any email that is unread will NOT be deleted.
- SKIP_SENT = true: If true, all items in sent folder are NOT deleted.
- SKIP_IMPORTANT: If true, any email assigned Important is NOT deleted. *Important emails are auto flagged by a gmail algorithm. Chances are these emails are not in fact important to you (defualt is False).
- SKIP_USER_MADE_LABELS: If true, any email with a user made custom label is NOT deleted. You dont need to identify them. The script looks up all labels and skips any label that was created by the user.
- SKIP_FROM_LIST: Emails received from these specific addresses will never be deleted reguardless of any settings above
- SKIP_CATEGORY_LIST: Emails received from these specific categories will never be deleted reguardless of any settings above
