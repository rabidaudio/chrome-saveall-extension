/* Icon from: http://somerandomdude.com/work/bitcons/
   Some source code from Google's example code.
   Obviously hacked together. Use at your own risk.
   I hereby release the rest into the Public Domain.
   --   Charles Knight 2013
*/

var running = false;
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
        if (!delta.state ||  (delta.state.current != 'complete'))
            return;
        if(running){
            running=false;
            chrome.downloads.show(id);
            console.log("DownloadTabs - done.");
            filepath = null;
        }
    });
}
      

function main(){
    running = true;
    var q = chrome.tabs.query({ currentWindow: true }, function(result){
        var count = 0;
        for (var i=0; i<result.length; i++){
            console.log("DownloadTabs - Downloading "+result[i].url);
            chrome.downloads.download({url: result[i].url}, function(id){
                count++;
                if(count==result.length){
                    listenAndOpenWhenDone(id);
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
  console.log("download listener cought this - "+item.filename);
  if(!filepath)
    filepath = "TabDownload-"+getTimeStamp()+"/";
  //console.log("suggesting:"+filepath+item.filename);
  if(running){
    console.log('DownloadTabs - Saving to '+filepath+item.filename);
      suggest({filename: filepath+item.filename,
               conflict_action: 'overwrite',
               conflictAction: 'overwrite'});
   }
});



chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('DownloadTabs - Beginning process...');
    main();
});

// TODO if filepath is null, set saveas in download command to true. then store
// filepath from the callback for the rest of the files
