const logo = document.querySelector('h1');
const form = document.querySelector('#searchForm');
const videosPanel = document.querySelector('.videos');
const fill = document.querySelector('.fill');

let currentPage = 1;
let totalPages = 1;
let currentQuery = '';
let isFetching = false;
let selectedSearchType = '';

//Input: API key's JSON file path, Output: API key
async function loadKey() {
  try {
    const response = await fetch('/api/key');
    const data = await response.text();
    return data;
  } catch (err) {
    throw new Error("Couldn't get the api key from the json", err);
  }
}

const getSearchType = () => {
  let moviesSelected = document.querySelector('#movies').checked;
  let tvShowsSelected = document.querySelector('#tv-shows').checked;

  if (moviesSelected && tvShowsSelected) return 'multi';
  else if (moviesSelected) return 'movie';
  else if (tvShowsSelected) return 'tv';
  else {
    return '';
  }
};

//Input: API key & search type & search query, Output: API Response Data
async function fetchData(apiKey, query, searchType, page = 1) {
  try {
    if (searchType === '') return;
    const url = `https://api.themoviedb.org/3/search/${searchType}?query=${encodeURIComponent(
      query
    )}&page=${page}`;

    const config = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };

    const apiResponse = await axios.get(url, config);

    return apiResponse.data;
  } catch (err) {
    console.error('There was a problem with the fetch operation:', err);
  }
}

const clearBody = () => {
  const elements = document.body.querySelectorAll('img');
  elements.forEach((element) => {
    element.remove();
  });
  videosPanel.innerHTML = '';
  fill.classList.remove('hide');
};

const makeImages = async (videoslist, searchType) => {
  fill.classList.add('hide');
  videosPanel.classList.remove('hide');
  let mediaType;

  for (let video of videoslist) {
    if (video.poster_path) {
      //creating the container
      const videoContainer = document.createElement('div');
      videoContainer.classList.add('video-container');

      //creating the image
      const newImg = document.createElement('img');
      newImg.loading = 'eager';

      if (searchType === 'movie') {
        mediaType = 'Movie';
      } else if (searchType === 'tv') {
        mediaType = 'TV Show';
      } else if (searchType === 'multi') {
        mediaType = video.media_type === 'tv' ? 'TV Show' : 'Movie';
      }

      //create the card for the info
      const infoCard = document.createElement('div');
      infoCard.classList.add('info-card');
      infoCard.innerHTML = `
        <p>${video.name || video.title}</p>
        <div class="details">
          <p>${video.vote_average.toFixed(1) || '0'} / 10</p>
          <p>${mediaType}</p>
        </div>
      `;

      newImg.src = `https://image.tmdb.org/t/p/w154/${video.poster_path}`;

      videoContainer.appendChild(newImg);
      videoContainer.appendChild(infoCard);
      videosPanel.appendChild(videoContainer);
    }
  }
};

logo.addEventListener('click', () => {
  window.location.href = '/';
});

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  clearBody();

  currentQuery = this.elements.query.value.trim();
  if (!currentQuery) return;
  currentPage = 1;
  totalPages = 1;

  const apiKey = await loadKey();
  selectedSearchType = getSearchType();
  const response = await fetchData(
    apiKey,
    currentQuery,
    selectedSearchType,
    currentPage
  );

  if (response) {
    totalPages = response.total_pages;
    makeImages(response.results, selectedSearchType);
  }
});

window.addEventListener('scroll', async function () {
  if (
    this.window.innerHeight + this.window.scrollY >=
      this.document.body.offsetHeight - 100 &&
    !isFetching &&
    currentPage < totalPages
  ) {
    isFetching = true;
    currentPage++;

    const apiKey = await loadKey();
    const response = await fetchData(
      apiKey,
      currentQuery,
      selectedSearchType,
      currentPage
    );
    response && makeImages(response.results, selectedSearchType);
    isFetching = false;
  }
});
