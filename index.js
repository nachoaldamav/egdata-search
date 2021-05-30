const axios = require("axios")
const algoliasearch = require('algoliasearch')
require('dotenv').config()

const client = algoliasearch('0X90LHIM7C', process.env.ALGOLIA_KEY)
const index = client.initIndex('games');

async function getGames() {
    const query = JSON.stringify({
        "query": "query searchStoreQuery($allowCountries: String, $category: String, $count: Int, $country: String!, $keywords: String, $locale: String, $namespace: String, $itemNs: String, $sortBy: String, $sortDir: String, $start: Int, $tag: String, $releaseDate: String, $withPrice: Boolean = false, $withPromotions: Boolean = false, $priceRange: String, $freeGame: Boolean, $onSale: Boolean, $effectiveDate: String) {\n  Catalog {\n    searchStore(\n      allowCountries: $allowCountries\n      category: $category\n      count: $count\n      country: $country\n      keywords: $keywords\n      locale: $locale\n      namespace: $namespace\n      itemNs: $itemNs\n      sortBy: $sortBy\n      sortDir: $sortDir\n      releaseDate: $releaseDate\n      start: $start\n      tag: $tag\n      priceRange: $priceRange\n      freeGame: $freeGame\n      onSale: $onSale\n      effectiveDate: $effectiveDate\n    ) {\n      elements {\n        title\n        id\n        namespace\n        description\n        effectiveDate\n        keyImages {\n          type\n          url\n        }\n        currentPrice\n        seller {\n          id\n          name\n        }\n        productSlug\n        urlSlug\n        url\n        tags {\n          id\n        }\n        items {\n          id\n          namespace\n        }\n        customAttributes {\n          key\n          value\n        }\n        categories {\n          path\n        }\n        price(country: $country) @include(if: $withPrice) {\n          totalPrice {\n            discountPrice\n            originalPrice\n            voucherDiscount\n            discount\n            currencyCode\n            currencyInfo {\n              decimals\n            }\n            fmtPrice(locale: $locale) {\n              originalPrice\n              discountPrice\n              intermediatePrice\n            }\n          }\n          lineOffers {\n            appliedRules {\n              id\n              endDate\n              discountSetting {\n                discountType\n              }\n            }\n          }\n        }\n        promotions(category: $category) @include(if: $withPromotions) {\n          promotionalOffers {\n            promotionalOffers {\n              startDate\n              endDate\n              discountSetting {\n                discountType\n                discountPercentage\n              }\n            }\n          }\n          upcomingPromotionalOffers {\n            promotionalOffers {\n              startDate\n              endDate\n              discountSetting {\n                discountType\n                discountPercentage\n              }\n            }\n          }\n        }\n      }\n      paging {\n        count\n        total\n      }\n    }\n  }\n}\n",
        "variables":{
            "category":"games/edition/base|software/edition/base",
            "count":1000,
            "country":"US",
            "keywords":"",
            "locale":"en-US",
            "sortDir":"DESC",
            "allowCountries":"US",
            "start":0,
            "tag":"",
            "withMapping":false,
            "withPrice":true
        }
    });

    var config = {
        method: 'post',
        url: 'https://www.epicgames.com/graphql',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : query
      };

    const games = await axios(config)
    .then(function(response) {
        console.log('Games list loaded || ' + response.data.data.Catalog.searchStore.paging.total + ' games found')
        return response.data.data.Catalog.searchStore.elements;
    })
    .catch(function (error) {
        console.error(error)
    });

    await games.forEach(game => {
        index.saveObject({
            objectID: game.id,
            title: game.title,
            effectiveDate: game.effectiveDate,
            seller: game.seller.name,
            productSlug: `https://www.epicgames.com/store/product/${game.productSlug}`,
            slug: game.productSlug.replace('/home', ''),
            namespace: game.namespace
          }).then(({ objectID }) => {
            console.log(game.title + ' added to the database!');
        }); 
    });
}

module.exports = getGames();