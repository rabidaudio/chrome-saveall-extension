/* Icon from: http://somerandomdude.com/work/bitcons/
   Some source code from Google's example code.
   Obviously hacked together. Use at your own risk.
   I hereby release the rest into the Public Domain.
   --   Charles Knight 2013
*/

var running = false;
var filepath = null;
var tab_num = {};
var danger_detected = false;

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

function pad(filename){
    var str = '' + (tab_num[filename] || 0);
    while (str.length < 3) {
        str = '0' + str;
    }
    return str;
}

function listenAndOpenWhenDone(id){
    chrome.downloads.onChanged.addListener(function(delta) {
        if (!delta.state ||  (delta.state.current != 'complete'))
            return;
        if(running){
            running=false;
            danger_detected=false;
            tab_num = {};
            chrome.downloads.show(id);
            console.log("DownloadTabs - done.");
            filepath = null;
        }
    });
}

function accept_if_dangerous(downid){
  //TODO this isn't perfect. It actually takes longer than clicking keep in the bottom bar. Either fix acceptDanger
  //    to show popups, or maybe if it is detected as dangerous, cancel download and restart as SaveAs... so dialog comes up
  chrome.downloads.search({id: downid}, function(results){
  	var r = results[0];
    //console.log("accept if dangerous called: " + r.url+ " =>" +r.danger + " (danger detected:"+danger_detected+")");
    if (danger_detected ||
        (r.state != 'in_progress') ||
        (r.danger == 'safe') ||
        (r.danger == 'accepted')
       ){
      return;
    }
    danger_detected = true;
    console.log("DownloadTabs - Dangerous file detected. Opening Chrome downloads page for approval");
    chrome.tabs.create({url: "chrome://downloads"} );//, function(tab){console.log("Downloads tab opened for acceptance");});
    /*chrome.downloads.acceptDanger(r.id, function(){
      console.log("DownloadTabs - Note: accepted warning for file " + r.url + " (" + r.danger+")");
      accept_if_dangerous(id); //call again to be sure
    });*/
  });
}

function main(wid){
    running = true;
    var q = chrome.tabs.query({ windowId: wid }, function(result){
        var count = 0;
        tab_num = {};
        for (var i=0; i<result.length; i++){
            console.log("DownloadTabs - Downloading "+result[i].url);
            var filename = result[i].url.replace(/.*\//, "");
            tab_num[filename] = i;
            chrome.downloads.download({url: result[i].url}, function(id){
                count++;
                //accept_if_dangerous(id); 
                window.setTimeout(function(){ accept_if_dangerous(id); }, 500);//the delay allows it to check the file first. TODO add listener instead
                if(count==result.length){
                    listenAndOpenWhenDone(id);
                    if( confirm('All done. Close the window?') ){
                            for(var j=0;j<result.length;j++) chrome.tabs.remove(result[j].id);
                    }
                }
            });
        }
    });
}


chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
    if(!filepath)
        filepath = "TabDownload-"+getTimeStamp()+"/";
  if(running){
    console.log('DownloadTabs - Saving to '+filepath+item.filename);
      suggest({filename: filepath+pad(item.filename)+"-"+item.filename,
               conflict_action: 'overwrite',
               conflictAction: 'overwrite'});
   }
});



chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('DownloadTabs - Beginning process...');
    //chrome.tabs.getCurrent(function callback(tab)) //tab.windowId || windows.WINDOW_ID_CURRENT //query {windowId:}
    //main();
    var wid = tab.windowId || windows.WINDOW_ID_CURRENT;
    main(wid);
});

// TODO if filepath is null, set saveas in download command to true. then store
// filepath from the callback for the rest of the files
