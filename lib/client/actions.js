import api from './api'
import * as articleDB from './db/article'

export const CHANGE_ARTICLE = 'CHANGE_ARTICLE'
export const EXPAND_ARTICLE = 'EXPAND_ARTICLE'
export const ARTICLE_SUMMARY = 'ARTICLE_SUMMARY'
export const ARTICLE_CONTENT = 'ARTICLE_CONTENT'
export const ARTICLE_FROM_DB = 'ARTICLE_FROM_DB'
export const ADD_TOAST = 'ADD_TOAST'
export const REMOVE_TOAST = 'REMOVE_TOAST'

export const START_SEARCH_SESSION = 'START_SEARCH_SESSION'
export const START_SEARCH_REQUEST = 'START_SEARCH_REQUEST'
export const STOP_SEARCH_REQUEST = 'STOP_SEARCH_REQUEST'
export const STOP_SEARCH_SESSION = 'STOP_SEARCH_SESSION'

export const SHOW_MENU = 'SHOW_MENU'
export const HIDE_MENU = 'HIDE_MENU'

function getArticle (title) {
  return (dispatch, getState) => {
    let articleMem = getState().articles[title]
    if (articleMem) return Promise.resolve(articleMem)
    else {
      return articleDB.get(title)
      // If article existed on DB, dispatch it
      .then((article) => {
        if (article) {
          dispatch({ type: ARTICLE_FROM_DB, title, article })
          // And return the updated in-memory article
          return getState().articles[title]
        }
      }).catch((e) => console.log(e))
    }
  }
}

export function fetchSummary (title) {
  return (dispatch, getState) => {
    return api.lead(title).then((doc) =>
      dispatch({ type: ARTICLE_SUMMARY, title, doc }))
  }
}

export function fetchContent (title) {
  return (dispatch, getState) => {
    return api.full(title).then((doc) =>
      dispatch({ type: ARTICLE_CONTENT, title, doc }))
  }
}

export function changeArticle (title, full) {
  return (dispatch, getState) => {
    dispatch({type: CHANGE_ARTICLE, title})
    // If we need the full article, go expand it
    if (full) {
      return dispatch(expandArticle(title))
    } else {
      // Else, go for the summary version
      // Get the article from memory/db
      return dispatch(getArticle(title))
        .then((article) => {
          // If never visited article or not fetched
          if (!article || !article.doc) {
            // Grab it from the API
            return dispatch(fetchSummary(title))
              // And cache it in the DB when received
              .then(() => {
                articleDB.set(title, getState().articles[title])
              })
          }
        })
    }
  }
}

export function expandArticle (title) {
  return (dispatch, getState) =>
    // Get the article from memory/db
    dispatch(getArticle(title))
      .then((article) => {
        dispatch({type: EXPAND_ARTICLE, title})
        articleDB.set(title, getState().articles[title])
        // If we don't have the full content
        if (!article || !(article.full && article.doc)) {
          // Grab it from the API
          return dispatch(fetchContent(title))
            // And cache it in the DB when received
            .then(() => {
              articleDB.set(title, getState().articles[title])
            })
        }
      })
}

export function startSearchSession () {
  return {
    type: START_SEARCH_SESSION
  }
}

function startSearchRequest (q) {
  return {
    type: START_SEARCH_REQUEST,
    q
  }
}

function stopSearchRequest (q, results) {
  return {
    type: STOP_SEARCH_REQUEST,
    q,
    results
  }
}

export function stopSearchSession () {
  return {
    type: STOP_SEARCH_SESSION
  }
}

export function search (q) {
  return function (dispatch, getState) {
    dispatch(startSearchRequest(q))

    return api.search(q)
      .then(({pages}) => dispatch(stopSearchRequest(q, pages)))
  }
}

export function addToast (toast) { return { type: ADD_TOAST, toast } }
export function removeToast (toast) { return { type: REMOVE_TOAST, toast } }

export function showToast (text, delay = 3000) {
  return (dispatch, getState) => {
    const toast = { text }
    dispatch(addToast(toast))
    setTimeout(() => dispatch(removeToast(toast)), delay)
  }
}

export function showMenu () { return { type: SHOW_MENU } }
export function hideMenu () { return { type: HIDE_MENU } }
