#!/usr/bin/env bash
export PUSH_TOKEN=cYEl8nxZPas:APA91bF2-CDo_Wvp18eMsnoPWuijmv0K2j1bWiW-wS1FPLizxlnb-DU-hOHL1FFIYs_I6xsJZXvEn0xr0RUkFLcvXvN2Hd12lc2dhz6bvJvEd4ToJUV4BSxTawAMp80gMSpd-tK2Raj4
export FCM_SERVER_KEY=AAAAOd7Dabc:APA91bHZRGP5nQEIeH7XIWfLsI6yE7neoHYTpbVgVZxI1r07qrz1BsqFYWZtf846qjP4_MZtTnKl1Kn6ZUZJix5YtIJPtuTWpMVZhl9SHbh8-Lv0gLC1bwkiK69bUCNVYYiTFKfzXUQx
curl --header "Authorization: key=$FCM_SERVER_KEY" \
  --header Content-Type:"application/json" \
  https://fcm.googleapis.com/fcm/send \
  -d "{\"to\":\"$PUSH_TOKEN\",\"data\":{\"_m\":\"test_message\",\"alert\":\"It Worked!\",\"title\":\"Test Push\", \"_sid\":\"SFMC\"}}"

