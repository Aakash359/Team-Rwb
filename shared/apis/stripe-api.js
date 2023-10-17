import { STRIPE_KEY } from '../constants/APIKeys-obfuscated';

const urlBase = "https://api.stripe.com/v1/";

export const getPaymentIntent = (id, secret) => {
  return fetch(`${urlBase}payment_intents/${id}?${secret}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Authorization': `Bearer ${STRIPE_KEY}`,
    },
  }).then((response) => {
    if (response.ok)
      return response.json();
    else {
      return response.json().then((error) => {
        throw error;
      });
    }
  });
};

export const confirmPaymentIntent = (formBody, id) => {
  return fetch(`${urlBase}payment_intents/${id}/confirm`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${STRIPE_KEY}`
    },
    body: formBody
  }).then((response) => {
    if (response.ok)
      return response.json();
    else {
      return response.json().then((error) => {
        throw error;
      });
    }
  });
};

export const createPaymentMethod = (formBody, data) => {
  return fetch(`${urlBase}payment_methods?type=card&` + formBody, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${STRIPE_KEY}`
    },
    body: data
  }).then((response) => {
    if (response.ok)
      return response.json();
    else {
      return response.json().then((error) => {
        throw error;
      });
    }
  });
};
