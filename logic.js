const DomParser = require('dom-parser'),
  needle = require('needle'),
  parser = new DomParser(),
  pattern = require('./module');
  company = pattern.pattern.company,
  stopper = false;

exports.count = async function count(category) {
  for (let url_key in company) {
    let url = '';
    if (company[url_key].url[category]) {
      url = company[url_key].url[category]
    } else {
      continue
    }
    await say(url, url_key, company[url_key].url_end)
  }
}

function delay() {
  return new Promise(resolve => setTimeout(resolve, 3000), reject => console.log(new Error))
}
async function say(url, url_key, url_end) {
  //await delay()
  await steps(url, url_key, url_end)
}
async function steps(url, url_key, url_end) {
  let i = 1;
  for (i; i < 25; i++) {
    info.innerHTML = `Scanned ${i-1} pages in ${url_key} company`;
    if (stopper == true) {
      stopper = false;
      return Promise.resolve()
    };
    await delay();
    i == 1 ? await getContent(url, url_key) : await getContent(url + url_end + i + '/', url_key)
  }
}
async function getContent(productCategory, company_key) {
  var company = pattern.pattern.company[company_key]
  console.log(productCategory)
  await needle('get', productCategory)
    .then(res => parser.parseFromString(res.body))
    .then(dom => company.getProductList(dom))
    .then(productList => {
      productList.forEach(function (item) {
        if (item.nodeName == company.identifier) {
          var productCard = company.getProductCard(item);
          var productProperites = company.getProductProperites(productCard)
          db.insert({
            "company": company.name,
            "prodName": productProperites.productName,
            "price": productProperites.productPrice,
            "stock": productProperites.stockStatus
          })
        }
      })
    })
    .then(db.find({}, (err, res) => {
      if (err) {
        alert(err)
        return Promise.resolve();
      }
      proc.innerHTML = `Has been scanned ${res.length} products`
    }))
    .catch(e => {
      alert(e)
      stopper = true;
    })
}