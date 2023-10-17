'use strict';

import AsyncStorage from './StorageHandler';
import moment from 'moment';

const ASYNC_STORAGE_KEY = 'user_event_drafts_';

class UserEventDrafts {
  drafts = [];
  user_id = 0;

  setUserID(user_id) {
    this.user_id=user_id;
  }

  createDraft(data) {
    data.draft_id = moment().format('x'); // Current time in milliseconds. Used for bookkeeping.;
    this.drafts.push(data);
    this._saveDrafts();
  }

  readDrafts() {
    return this._loadDrafts();
  }

  updateDraft(data, id) {
    const index = this._getIndexFromID(id);
    if (index < 0) throw new Error("Cannot find event with id.");
    this.drafts[index] = data;
    this._saveDrafts();
  }

  deleteDraft(id) {
    const index = this._getIndexFromID(id);
    if (index < 0) throw new Error("Cannot find event with id.");
    this.drafts.splice(index, 1);
    this._saveDrafts()
  }

  _getIndexFromID(id) {
    for (let i = 0; i < this.drafts.length; i++) {
      if (this.drafts[i].draft_id === id) {
        return i;
      }
    }
    return -1;
  }

  _saveDrafts() {
    AsyncStorage.setItem(`${ASYNC_STORAGE_KEY}${this.user_id}`, JSON.stringify(this.drafts));
  }

  _loadDrafts() {
    return AsyncStorage.getItem(`${ASYNC_STORAGE_KEY}${this.user_id}`)
      .then(JSON.parse)
      .then((drafts) => {
        this._setDrafts(drafts);
        return drafts;
      });
  }
  _setDrafts(drafts) {
    this.drafts = drafts;
  }
}

export let userEventDrafts = new UserEventDrafts();
