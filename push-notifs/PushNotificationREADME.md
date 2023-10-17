# Push Notification Instructions

For Team RWB we use Salesforce marketing cloud for pushing. This can be found by searching `s10` in our 1pass.

## Setting up

1. Log in with the provided account and hover over "Mobile Studio" and select "MobilePush".

2. If you do not have a contact list already, in the "Contacts" box select "Manage".

3. Click "Lists" at the top left and then click "Create List" at the top right.

4. Select "Filtered List" and start creating your list.

5. Select "System Data" > "Contact" and then drag "Contact Key" into the "Filter Criteria" box.

6. Find the user you are testing with on Salesforce and copy the value for "Contact ID (long)"

NOTE: If you add multiple users, make sure to change the "AND" to an "OR"

7. Click "Save as Filter", give it a name, and save it.

## Confirming users

Before trying to send, you should confirm that a user has a device ID

1. Select your list

2. Select the "Contacts" tab

3. Confirm there is a device ID next to a contact key

NOTE: If you do not see one, make sure the account has visited the initial tab after logging in. This is where the device id is sent. It might take a few minutes before it shows up.

## Sending pushes

1. From the "Mobile Studio" > "MobilePush" Overview section click "Create Message"

2. Select "Outbound" and click "next".

3. Fill in the message name and select "Team RWB" for the App. Send Method and Push Method can keep their default values. Click "next".

4. Click "Select Audience Type.." > "Contact List" and find your contact list. Make sure it shows up in "Target Lists".
   Toggle "Auto-refresh before send". Click "next".

5. Fill in "Title", "Subtitle", and "Message" with what you want. Put an event link in "Open Direct" (ex. https://members.teamrwb.org/events/5940). Click "next".

6. Confirm that audience list is the size of your list (IT SHOULD NOT BE IN THE 1000s). Confirm event and click "send" and click "confirm".

# Testing Local Notifications

iOS:

You can retrieve the apns file from https://phabricator.retronyms.com/source/apnst/repository/master/ and save it in the repro at the top level per your needs.

Things you need P8 file (1pass), key id (`4KZYNF7KK9`, which is part of the p8 file name), team id (`6ET73A82RA`, found at https://developer.apple.com/account/#/overview/teamID).

Additionally, you need a python3 environment set up with pip and virtualenv

Set up the apns file with your device id (printed in xcode) and your path to the p8 file

1. Create your virutal environment `python3 -m venv venv`

2. Activate it `source venv/bin/activate`

3. Install the requirements `pip install -r requirements.txt`

4. Activate a python instance `python`

5. Import apns.py `import apns`

6. Run the test function in apns.py `apns.test()`

Android:

1. You can test Android deep links with ADB: `adb shell am start -W -a android.intent.action.VIEW -d "someURLYouWantToTest"`
