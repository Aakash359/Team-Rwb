# -*- coding: utf8 -*-
import jwt
import time
import json
import os 

from hyper import HTTPConnection

class ApnsPusher:
	def __init__(self, apns_key_id = '', apns_key_name = '.p8', team_id = '', bundle_id = ''):
		self.ALGORITHM = 'ES256'
		self.APNS_KEY_ID = apns_key_id
		self.APNS_AUTH_KEY = '/' + apns_key_name
		self.TEAM_ID = team_id
		self.BUNDLE_ID = bundle_id

	def push(self, payload, device_token, isProduction):
		file = open(self.APNS_AUTH_KEY)
		secret = file.read()
		token = jwt.encode({
		            'iss': self.TEAM_ID,
		            'iat': time.time()
		        },
		        secret,
		        algorithm = self.ALGORITHM,
		        headers = {
		            'alg': self.ALGORITHM,
		            'kid': self.APNS_KEY_ID,
		        }
		)
		path = '/3/device/{0}'.format(device_token)
		request_headers = {
	        'apns-expiration': '0',
	        'apns-priority': '10',
	        'apns-topic': self.BUNDLE_ID,
	        'authorization': 'bearer {0}'.format(token.decode('ascii'))
		}
		if isProduction:
			conn = HTTPConnection('api.push.apple.com:443')
		else :
			conn = HTTPConnection('api.development.push.apple.com:443')
		payload = json.dumps(payload).encode('utf-8')
		conn.request(
	        'POST',
	        path,
	        payload,
	        headers=request_headers
		)

		resp = conn.get_response()
		print(resp.status)
		print(resp.read())
		return resp
apns_key_path = "/Users/danielellman/Downloads/AuthKey_4KZYNF7KK9.p8" #change this
key_id = "4KZYNF7KK9"
team_id = "6ET73A82RA"
device_token = '6277eda2306933c50e0f235248f0fd014f3c2138b366a331b86c6fc3bd83a325' #change this, you will see it printed in xcode under "push token"
prod_event_test_url = u'https://members.teamrwb.org/events/5940'
staging_event_test_url = u'https://members-staging.teamrwb.org/events/225068'
virtual_list_test_url = u'https://members-staging.teamrwb.org/events?is_virtual=true&sort=attendees'
def test():
	apns = ApnsPusher(key_id,apns_key_path,team_id,"org.teamrwb.TeamRWB")
	apns.push(
		{
			'rwb_url': virtual_list_test_url,
			'aps': {
					'sound': 'default',
					'alert': u'Event Link Test',
					'title': u'Test Title',
					'subtitle': u'Test Subtitle'
				}
		},
		device_token,
		False
	)
