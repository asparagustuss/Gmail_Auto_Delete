# Gmail_Auto_Delete
An easy to use google Apps Script that automatically deletes emails nightly. Options include: Age, Yellow Star, Important, User Labels, and Sent From.


- Copy and paste the code into the an new .gs file on https://script.google.com/.
- Install the Gmail API servce. Insure the Identifier is 'Gmail'.
- Set your options
- Start the 'startup' function. 
- Done!






Options Explained
- DELETE_AFTER_DAYS: Only delete emails older than X days (0 includes EVERYTHING/All emails reguardless of when received)
- SKIP_ASSIGNED_YELLOW_STAR: If true, any email with an assigned Yellow Star is NOT deleted.
- SKIP_ASSIGNED_IMPORTANT: If true, any email assigned Important is NOT deleted. *Important emails are auto flagged by a gmail algorithm. Chances are these emails are not in fact important to you (defualt is False).
- SKIP_ASSIGNED_USER_MADE_LABELS: If true, any email with a user made custom label is NOT deleted.
- SKIP_FROM_LIST: Emails received from these specific addresses will never be deleted reguardless of any settings above



About:
With drive capacity now being a thing for Google services this seems really useful to me. The script works by deletioning in blocks of 200 up 1000 per tiggered instance. After 1000 emails have been deleted if there are more remaining it will start another trigger in 60 seconds. If no emails are left to delete then the nightly trigger is created. It looks like about 3000-4000 emails is the most that can be deleted in a day. Based on how many excess emails you have this could take a week or more.

When reviewing the code the trigger creation and deletion method may seem odd, but Google seems to be limiting how triggers can be run and how many can be run consecutively. If to many triggers are run one after another then it will just cancel all triggers for the project--even a nightly. The method employed here ensures that reguardless of what shenanigans Google is using on the server side to stop triggers this code will always rerun nightly. 
