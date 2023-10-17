import AsyncStorage from './StorageHandler';
import {isObject} from '../utils/Helpers';
import {MILITARY_STATUSES} from '../../shared/constants/MilitaryStatusSlugs';

class UserProfile {
  newsletter_subscription = [];
  anchor_chapter = {};
  anonymous_profile = false;
  combat_deployment_operations = null;
  combat_zone = null;
  do_not_send_any_email = null;
  eagle_leader = null;
  eagle_leader_title = null;
  email = null;
  email_verified = null;
  first_name = null;
  gender = null;
  has_disability = null;
  id = null;
  last_name = null;
  legal_waiver_signed = null;
  location = {};
  military_branch = null;
  military_family_member = null;
  military_status = null;
  military_specialty = null;
  military_rank = null;
  military_ets = null;
  phone = null;
  preferred_chapter = {};
  profile_completed = null;
  profile_photo_url = null;
  cover_photo_url = null;
  profile_bio = null;
  roles = [];
  shipping_location = {};
  shirt_size = null;
  registration_started_via_app = false;
  salesforce_contact_id = null;
  constructor() {
    this.dataLoaded = false;
    this.saveToUserProfile = this.saveToUserProfile.bind(this);
    this.setUserId = this.setUserId.bind(this);
    this._loadUserProfile = this._loadUserProfile.bind(this);
    this.init = this.init.bind(this);
  }
  _setUserProfile(data) {
    const {
      newsletter_subscription,
      anchor_chapter,
      anonymous_profile,
      combat_deployment_operations,
      combat_zone,
      do_not_send_any_email,
      eagle_leader,
      eagle_leader_title,
      email,
      email_verified,
      first_name,
      gender,
      has_disability,
      id,
      last_name,
      legal_waiver_signed,
      location,
      military_branch,
      military_family_member,
      military_status,
      military_specialty,
      military_rank,
      military_ets,
      phone,
      preferred_chapter,
      profile_completed,
      profile_photo_url,
      cover_photo_url,
      profile_bio,
      roles,
      shipping_location,
      shirt_size,
      registration_started_via_app,
      salesforce_contact_id,
    } = data;
    this.newsletter_subscription = newsletter_subscription;
    this.anchor_chapter = anchor_chapter;
    this.anonymous_profile = anonymous_profile;
    this.combat_deployment_operations = combat_deployment_operations;
    this.combat_zone = combat_zone;
    this.do_not_send_any_email = do_not_send_any_email;
    this.eagle_leader = eagle_leader;
    this.eagle_leader_title = eagle_leader_title;
    this.email = email;
    this.email_verified = email_verified;
    this.first_name = first_name;
    this.gender = gender;
    this.has_disability = has_disability;
    this.id = id;
    this.last_name = last_name;
    this.legal_waiver_signed = legal_waiver_signed;
    this.location = location;
    this.military_branch = military_branch;
    this.military_family_member = military_family_member;
    this.military_status = military_status;
    this.military_specialty = military_specialty;
    this.military_rank = military_rank;
    this.military_ets = military_ets;
    this.phone = phone;
    this.preferred_chapter = preferred_chapter;
    this.profile_completed = profile_completed;
    this.profile_photo_url = profile_photo_url;
    this.cover_photo_url = cover_photo_url;

    this.profile_bio = profile_bio;
    // this.roles = roles; // unable to set roles of a user
    this.shipping_location = shipping_location;
    this.shirt_size = shirt_size;
    this.registration_started_via_app = registration_started_via_app;
    this.salesforce_contact_id = salesforce_contact_id;
    return this.getUserProfile();
  }
  init() {
    if (!this.dataLoaded) {
      this.dataLoaded = true;
      return this._loadUserProfile();
    } else {
      return Promise.resolve(this.getUserProfile());
    }
  }
  setUserId(id) {
    this.id = id;
  }
  saveToUserProfile(value) {
    if (!value || !isObject(value))
      throw new TypeError('input must be of type Object');
    this._setUserProfile(value);
    return new Promise((resolve) => {
      AsyncStorage.setItem('user_profile', JSON.stringify(value)).then(resolve);
    });
  }
  _loadUserProfile() {
    return AsyncStorage.getItem('user_profile').then((data) => {
      if (data) {
        return this._setUserProfile(JSON.parse(data));
      } else {
        throw new Error();
      }
    });
  }
  getUserProfile() {
    const {
      newsletter_subscription,
      anchor_chapter,
      anonymous_profile,
      combat_deployment_operations,
      combat_zone,
      do_not_send_any_email,
      eagle_leader,
      eagle_leader_title,
      email,
      email_verified,
      first_name,
      gender,
      has_disability,
      last_name,
      legal_waiver_signed,
      location,
      military_branch,
      military_family_member,
      military_status,
      military_specialty,
      military_rank,
      military_ets,
      phone,
      preferred_chapter,
      profile_completed,
      profile_photo_url,
      cover_photo_url,
      profile_bio,
      roles,
      shipping_location,
      shirt_size,
      id,
      registration_started_via_app,
      salesforce_contact_id,
    } = this;
    return {
      newsletter_subscription,
      anchor_chapter,
      anonymous_profile,
      combat_deployment_operations,
      combat_zone,
      do_not_send_any_email,
      eagle_leader,
      eagle_leader_title,
      email,
      email_verified,
      first_name,
      gender,
      has_disability,
      last_name,
      legal_waiver_signed,
      location,
      military_branch,
      military_family_member,
      military_status,
      military_specialty,
      military_rank,
      military_ets,
      phone,
      preferred_chapter,
      profile_completed,
      profile_photo_url,
      cover_photo_url,
      profile_bio,
      roles,
      shipping_location,
      shirt_size,
      id,
      registration_started_via_app,
      salesforce_contact_id,
    };
  }

  /**
   * Generates a payload for use with posting to the API server.
   */
  formatPayload(patch) {
    let data = Object.assign({}, this, patch);

    const {
      anchor_chapter,
      anonymous_profile,
      combat_deployment_operations,
      combat_zone,
      do_not_send_any_email,
      eagle_leader_title,
      eagle_leader,
      email_verified,
      email,
      military_ets,
      first_name,
      gender,
      has_disability,
      id,
      last_name,
      legal_waiver_signed,
      location,
      military_branch,
      military_family_member,
      military_status,
      military_rank,
      military_specialty,
      newsletter_subscription,
      phone,
      preferred_chapter,
      profile_bio,
      profile_completed,
      profile_photo_url,
      cover_photo_url,
      registration_started_via_app,
      roles,
      shipping_location,
      shirt_size,
    } = data;

    let payload = {
      // Personal Info
      first_name: first_name,
      last_name: last_name,
      email: email,
      gender: gender,

      address_type: location.address_type,
      country: location.country,
      state: location.address_state,
      city: location.city,
      zipcode: location.zip,
      street: location.address,
      street_2: location.address_2,

      phone: phone,

      // Social profile
      profile_bio: profile_bio,

      // Military Service
      military_status: military_status,

      // Legal Waiver
      legal_waiver_signed: legal_waiver_signed,
      anonymous_profile: anonymous_profile,
      profile_completed: profile_completed,

      // Red Shirt
      shirt_size: shirt_size,
    };

    if (military_status === MILITARY_STATUSES.civilian) {
      payload.military_family_member = military_family_member;
    } else {
      payload.military_branch = military_branch;
      payload.military_specialty = military_specialty;
      payload.military_rank = military_rank;
      payload.has_disability = has_disability;
      payload.combat_zone = combat_zone;
      payload.combat_deployment_operations = combat_deployment_operations;
    }
    if (military_status === MILITARY_STATUSES.veteran) {
      payload.military_ets = military_ets;
    }
    if (shipping_location.shipping_address) {
      payload.shipping_address = true;
      payload.shipping_country = shipping_location.country;
      payload.shipping_state = shipping_location.address_state;
      payload.shipping_city = shipping_location.city;
      payload.shipping_zip = shipping_location.zip;
      payload.shipping_street = shipping_location.address;
    } else {
      payload.shipping_address = false;
    }

    return payload;
  }
  deleteUserProfile() {
    return AsyncStorage.removeItem('user_profile');
  }
}

export let userProfile = new UserProfile();
