// IIFE Function.
(() => {
	
  // One for icons and their location
  // Other for youtube video timestamp
  let youtubeLeftControls, youtubePlayer;

  // Global variable that will used to identify the video.
  let currentVideo = "";

  let currentVideoBookmarks = [];

  // fetching the value of bookmarks of a particular video.
  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };

    currentVideoBookmarks = await fetchBookmarks();

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  };

  const newVideoLoaded = async () => {
   
   
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

    currentVideoBookmarks = await fetchBookmarks();

    // if button not created.
    if (!bookmarkBtnExists) {

      // UI-Portion
      const bookmarkBtn = document.createElement("img");
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";
	
      // to access the {captions,miniplayer....} Sections.
      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];

      // to access the video-related info.
      youtubePlayer = document.getElementsByClassName('video-stream')[0];

      // adding ICON.
      youtubeLeftControls.appendChild(bookmarkBtn);

      // On-Click Functionality.
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  // Actions when  message recieved from background.js
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    // If new video is loaded.
    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();

    }
    else if (type === "PLAY")
    {
      youtubePlayer.currentTime = value;
    } 
   else if ( type === "DELETE") 
    {
      currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });

      response(currentVideoBookmarks);
    }
  });

  newVideoLoaded();
})();

// substr is deprecated.

//const getTime = t => {
//  var date = new Date(0);
//  date.setSeconds(t);
//
//  return date.toISOString().substr(11, 8);
//};

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().slice(11, 19); // Using slice(11, 19) to extract HH:mm:ss format
}

