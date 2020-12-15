# react-redux-async-action

[![Build Status](https://img.shields.io/travis/german-p/react-redux-async-action.svg)](https://travis-ci.org/german-p/react-redux-async-action) 
[![Coverage Status](https://coveralls.io/repos/github/german-p/react-redux-async-action/badge.svg?branch=master)](https://coveralls.io/github/german-p/react-redux-async-action?branch=master)
[![npm](https://img.shields.io/npm/v/react-redux-async-action.svg)](https://www.npmjs.com/package/react-redux-async-action)
![NPM](https://img.shields.io/npm/l/react-redux-async-action.svg)

A set of helper functions to reduce the boilerplate of working with redux actions that trigger an async call and end up dispatching a sucess or failure of said action upon completion

## Installation:

```
npm install --save react-redux-async-action
```
```
yarn add react-redux-async-action
```


## Motivation

When using redux I often run into this scenario, say we want to fetch some data so we need the action to trigger the call from a component:

```javascript
export const FETCH_DATA = 'FETCH_DATA';

export const fetchData = (id)=> ({ type: FETCH_DATA, id });
```

But we also need the sucess and failure variants to dispatch when the call completes:
```javascript
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS';
export const FETCH_DATA_FAILURE = 'FETCH_DATA_FAILURE';

export const fetchDataSuccess = (data)=> ({ type: FETCH_DATA_SUCCESS, data });
export const fetchDataFailure = (error)=> ({ type: FETCH_DATA_FAILURE, error });
```

So if we were using thunks, we would need something like this:

```javascript
async function getDataFromRestApi(id) {
  ...
  return [];
}

export const fetchDataThunk = (id) => (dispatch) => {
  dispatch(fetchData(id));
  getDataFromRestApi(id)
    .then(result=> {
      dispatch(fetchDataSuccess(result));
    })
    .catch(error=> {
      dispatch(fetchDataFailure(error));
    });
};
```

and your reducer would look something like this:


```javascript
import { FETCH_DATA, FETCH_DATA_SUCCESS, FETCH_DATA_FAILURE } from './actionTypes';

switch(action.type) {
//...  
  case FETCH_DATA:
    return {...state, fetchingData: true};
  case FETCH_DATA_SUCCESS:
    return {...state, fetchingData: false, data: action.data};
  case FETCH_DATA_FAILURE:
    return {...state, fetchingData: false, fetchError: action.error.message};
//...  
}
```
This becomes quite repetive when you have different async actions on your application and this aims to alliviate that.


# Usage

> #### An important convention
> The shape of all your actions should be the same:
> ```
> { type, payload, error }
> ```
> * type which is the string constant that identifies the action
> * payload can be anything, an object, a string, etc
> * error is optional and will be provided in case its a _FAILURE action

Now you only really need to declare the action:

```javascript
import { success, failure, asThunk } from 'react-redux-async-action';

export const FETCH_DATA = 'FETCH_DATA';
const fetchData = (id)=> ({ type: FETCH_DATA, payload: id });

```
and your thunk

```javascript
export const fetchDataThunk = asThunk(fetchData, (payload)=> getDataFromRestApi(payload.id));
```

Your reducer would be similar as before, but you can use the sucess and failure helpers on the action type which looks a little bit more semantic.

```javascript
import { FETCH_DATA } from './actionTypes';
import { success, failure } from 'react-redux-async-action';

switch(action.type) {
//...  
  case FETCH_DATA:
    return {...state, fetchingData: true};
  case success(FETCH_DATA):
    return {...state, fetchingData: false, data: action.data};
  case failure(FETCH_DATA):
    return {...state, fetchingData: false, fetchError: action.error.message};
//...  
}
```

This convention allows you to handle all failure actions on one place if you want to: 

```javascript
  if(action.type.endsWith('_FAILURE'))
    return {...state, errors: [...state.errors, action.error]};
```

# Available helpers in the package


## **success**
>Suffixes the _SUCCESS string to the action's type constant if it's a string or action's type property if it's an action object
```javascript
function success(action)
```

|parameter|type|description|
|---------|----|-----------|
|action|string<br/>object|The action constant string e.g. 'FETCH_DATA'<br/>The action object e.g. { type: 'FETCH_DATA' payload: { id: 42 }}|
---
## **failure**
>Suffixes the _FAILURE string to the action's type constant if it's a string or action's type property if it's an action object.  
>It also adds an error object to the action representing the error that caused the failure
```javascript
function failure(action, error)
```
|parameter|type|description|
|---------|----|-----------|
|action|string<br/>object|The action constant string e.g. 'FETCH_DATA'<br/>The action object e.g. { type: 'FETCH_DATA' payload: { id: 42 }}|
|error|Error|The exception that caused the failure

---
## **asThunk**

> Creates a thunk that calls an async function and dispatches success or failure actions based on the outcome.  
> It can be customized to do additional logic on either case.

```javascript
function asThunk(actionCreator, asyncCall, afterSuccess, afterFailure)
```
|parameter|type|description|
|---------|----|-----------|
|actionCreator|function(payload)|The action creator function to create a thunk for
|asyncCall|function(payload)|The async function to execute when the action is dispatched<br/>its return value will be provided to the _SUCCESS action as its payload
|afterSuccess|function(action, result, dispatch)|_(optional)_ The function to execute after the async call succeeds and _SUCCESS action is dispatched<br/>**action**: the originally dispatched action<br/>**result**: the return value of the asyncCall function<br/>**dispatch**: the dispatch function in case you want to dispatch additional actions
|afterFailure|function(action, error, dispatch)|_(optional)_ The function to execute after the async call fails and _FAILURE action is dispatched<br/>**action**: the originally dispatched action<br/>**error**: the error caught from the asyncCall invocation<br/>**dispatch**: the dispatch function in case you want to dispatch additional actions
