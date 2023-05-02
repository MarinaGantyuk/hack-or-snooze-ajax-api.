"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="fa-star far"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function addStoryToApiAndPage(evt) {
  // prevent form default reload
  evt.preventDefault();

  // grab the author name, story title and story url
  const author = $("#author-name").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  const story = await storyList.addStory(currentUser, { title, url, author });

  const $story = generateStoryMarkup(story); // generate story html
  $allStoriesList.append($story); // add to it's container (allstories list)

  $submitForm.slideUp("slow"); // hide form
  $submitForm.trigger("reset"); // reset form
}
$submitForm.on("submit", addStoryToApiAndPage);

async function addAndRemoveFavorite(evt) {
  const targetEl = $(evt.target);
  // get id of li element clicked
  const storyId = targetEl.closest("li").attr("id");
  // get story
  const story = storyList.stories.find((s) => s.storyId == storyId);

  // check if star is favorite (has fas) then unfavorite it else make it favorite
  if (targetEl.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    targetEl.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    targetEl.closest("i").toggleClass("fas far");
  }
}
$storyList.on("click", ".star", addAndRemoveFavorite);
