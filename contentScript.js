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

    // Before adding to the bookmark, first pre-existing bookmarks must be loaded if they are present. 
    currentVideoBookmarks = await fetchBookmarks();

    // Storing the timestamp of a praticular video in User's Browser.
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  };

	
  const newVideoLoaded = async () => {
   
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

    // Loading the bookmarks related to that particular video.
    currentVideoBookmarks = await fetchBookmarks();

    // If button not created.
    if (!bookmarkBtnExists) {

      // UI-Portion
      const bookmarkBtn = document.createElement("img");
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";
	
      // To access the {captions,miniplayer....} Sections.
      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];

      // To access the Video-related info (components).
      youtubePlayer = document.getElementsByClassName('video-stream')[0];

      // Adding  (+) Icon to the control buttons..
      youtubeLeftControls.appendChild(bookmarkBtn);

      // On-Click Functionality on the icon to grab the timestamp of the video.
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  // Actions when  message recieved from background.js
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    // If new video is loaded.
    if (type === "NEW") {
      currentVideo = videoId;

      // Call the newVideo Function.
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

  // It will be invoked everytime our contentScript matches with the Youtube.com
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

