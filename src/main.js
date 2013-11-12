var finished = false;
var filepath = null;

function getTimeStamp() {
    var now = new Date();
    return ((now.getMonth() + 1) + '-' +
            (now.getDate()) + '-' +
             now.getFullYear() + "_" +
             now.getHours() + '.' +
             ((now.getMinutes() < 10)
                 ? ("0" + now.getMinutes())
                 : (now.getMinutes())) + '.' +
             ((now.getSeconds() < 10)
                 ? ("0" + now.getSeconds())
                 : (now.getSeconds())));
}

function listenAndOpenWhenDone(id){
    chrome.downloads.onChanged.addListener(function(delta) {
      if (!delta.state ||
          (delta.state.current != 'complete')) {
        return;
      }
      if(!finished){
            finished=true;
            chrome.downloads.show(id);
            console.log("DownloadTabs - done.");
      }
    });
}
      

function doit(){
    //console.log("inside doit");
    var q = chrome.tabs.query({ currentWindow: true }, function(result){
        //console.log("inside query");
        var count = 0;
        //chrome.downloads.download({url: result[0].url
        for (var i=0; i<result.length; i++){
            console.log("DownloadTabs - Downloading "+result[i].url);
            chrome.downloads.download({url: result[i].url}, function(id){
                count++;
                //console.log(count);
                if(count==result.length){
                    listenAndOpenWhenDone(id);
                    //console.log(id);
                    if( confirm('All done. Close the window?') ){
                            //window.close();
                            //chrome.windows.remove(chrome.windows.WINDOW_ID_CURRENT);
                            for(var j=0;j<result.length;j++) chrome.tabs.remove(result[j].id);
                    }
                }
            });
        }
    });
}

chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
  //console.log("determining filename listener called--"+item.filename);
  if(!filepath)
    filepath = "TabDownload-"+getTimeStamp()+"/";
  //console.log("suggesting:"+filepath+item.filename);
  suggest({filename: filepath+item.filename,
           conflict_action: 'overwrite',
           conflictAction: 'overwrite'});
});

chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('DownloadTabs - Beginning process...');
    doit();
});

//if filepath is null, set saveas in download command to true. then store
// filepath from the callback

/*

{
  "name": "Download Open Tabs",
  "description": "Automatically save all open tabs in current window to the same directory.",
  "version": "0.1",
  "minimum_chrome_version": "16.0.884",
  "permissions": ["downloads", "<all_urls>", "tabs"],
  "background": {
    "scripts": ["main.js"],
    "persistent": false
  },
  "browser_action": {
    "default_title": "Download all pages"
  },
  "manifest_version": 2
}

*/

//chrome.windows.WINDOW_ID_CURRENT
//return the id of the current window

/*chrome.tabs.query(object queryInfo, function callback)
Gets all tabs that have the specified properties, or all tabs if no properties are specified.

Parameters

queryInfo ( object )
    active ( optional boolean ) Whether the tabs are active in their windows.
    pinned ( optional boolean )Whether the tabs are pinned.
    highlighted ( optional boolean )Whether the tabs are highlighted.
    currentWindow ( optional boolean )Whether the tabs are in the current window.
    lastFocusedWindow ( optional boolean )Whether the tabs are in the last focused window.
    status ( optional enum of "loading", or "complete" )Whether the tabs have completed loading.
    title ( optional string )Match page titles against a pattern.
    url ( optional string )Match tabs against a URL pattern. Note that fragment identifiers are not matched.
    windowId ( optional integer )The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window.
    windowType ( optional enum of "normal", "popup", "panel", or "app" )The type of window the tabs are in.
    index ( optional integer )The position of the tabs within their windows.
callback ( function )
    function(array of Tab result) {...};
    result ( array of Tab )
*/


/*
{
  "name": "Page Redder",
  "description": "Make the current page red",
  "version": "2.0",
  "permissions": [
    "activeTab"
  ],
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "browser_action": {
    "default_title": "Make this page red"
  },
  "manifest_version": 2
}
// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!');
  chrome.tabs.executeScript({
    code: 'document.body.style.backgroundColor="red"'
  });
});
*/



//var window = chrome.windows.WINDOW_ID_CURRENT;
