import csv
import sys
import string 
usage = "python import_mobile_tokens.py user_devices.csv usermeta.csv"
if len(sys.argv) != 3:
   print (usage)
user_meta = sys.argv[-1]
user_devices = sys.argv[-2]
user_map = {}
lines = open(user_meta,"r").readlines()
for line in lines:
    c = line.split(",")
    if len(c)>2:
        if c[2] == '"salesforce_contact_id"':
            cid = c[3].strip()
            cid = cid.replace('"',"")
            uid = c[1].replace('"','')
            user_map[int(uid)] = cid
lines = open(user_devices,"r").readlines()
for line in lines:
    c = line.split(",")
    device_uuid = c[0].replace('"','')
    token = c[2].replace('"','')
    platform = "Android OS"
    uid = c[1].replace('"','')
    uid = int(uid)
    if len(token) == 64:
        platform = "iPhone OS"

    if uid in user_map:
        c = [user_map[uid]] + [platform,device_uuid,token]
        print (string.join(c,','))
