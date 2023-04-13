const play_scraper = require('google-play-scraper');
const app_store_scraper = require('app-store-scraper');
const ObjectsToCsv = require('objects-to-csv');

const country = 'us';
const language = 'en';
const apple_app_id = '434893913';
const google_app_name = 'com.lookout';
const googleLimit = 100;
const appleNumberOfPages = 2 // max is 10;

async function downloadReviews() {
   const g_reviews = await play_scraper.reviews({
    appId: google_app_name,
    sort: play_scraper.sort.NEWEST,
    num: googleLimit
  });

  let a_reviews = [];

  for (let pageNumebr = 0; pageNumebr < appleNumberOfPages +1; pageNumebr++) {
   const a_reviews_page = await app_store_scraper.reviews({
    id: apple_app_id,
    sort: app_store_scraper.sort.RECENT,
    country: country,
    page: pageNumebr
   });

   a_reviews = a_reviews.concat(a_reviews_page);
  }


  const g_df = g_reviews.data.map((r) => {
    return {
      source: 'Google Play',
      review_id: r.id,
      user_name: r.userName,
      review_description: r.text,
      rating: r.score,
      review_title: r.title,
      review_date: new Date(r.date).toISOString(),
      developer_response: r.replyText,
      developer_response_date: r.replyDate ? new Date(r.replyDate).toISOString() : null,
      thumbs_up: r.thumbsUp,
      language_code: language,
      country_code: country,
    };
  });

  const a_df = a_reviews.map((r) => {
    return {
      source: 'App Store',
      review_id: r.id,
      user_name: r.userName,
      review_description: r.text,
      rating: r.score,
      review_title: r.title,
      review_date: new Date(r.updated).toISOString(),
      developer_response: null,
      developer_response_date: null,
      thumbs_up: null,
      language_code: language,
      country_code: country,
    };
  });

  const result = g_df.concat(a_df);

  const documents_path = process.env.HOME || process.env.USERPROFILE + "/Documents";

  const csv = new ObjectsToCsv(result);
  await csv.toDisk(documents_path + '/cake.csv');

  console.log(`All done, data has been written to ${documents_path}/cake.csv, have fun :D`);
}

downloadReviews();
