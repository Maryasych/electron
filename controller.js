const logic = require('./logic'),
    Datastore = require('nedb'),
    db = new Datastore({
        filename: 'dd',
        autoload: true
    });
db.loadDatabase(function (err) { // Callback is optional
    // Now commands will be executed
});

let buttons = document.getElementById('buttons'),
    searchField = document.getElementById('search-field'),
    scrapped = document.getElementById('scrapped'),
    proc = document.getElementById('process'),
    info = document.getElementById('info'),
    currency = 1;

document.getElementById('currency').onblur = function () {
    currency = isNaN(this.value) ? this.value = 1 : this.value;
};

buttons.onclick = (event) => {
    let button = event.target;
    button.id !== 'clear' ? logic.count(button.id) : db.remove({}, {
        multi: true,
    });
}

searchField.oninput = function () {
    if (this.value.length >= 3) {
        let val = this.value;
        db.find({
            prodName: new RegExp(val, 'i')
        }).sort({
            company: 1,
            stock: 1,
            price: 1,
        }).exec(
            function (err, res) {
                if (err) {
                    console.log(err);
                    return 0;
                }
                showTable(res, scrapped)
            })
    } else if (this.value.length == 0) {
        scrapped.innerHTML = ''
    }
};

function showTable(res, result) {
    result.innerHTML = '';
    res.forEach((item, i) => {
        result.innerHTML += `
        <tr>
        <td>${res[i].company}</td>
        <td>${res[i].prodName}</td>
        <td>${((res[i].price)/currency).toFixed(2)}</td>
        ${res[i].stock.toLowerCase().replace(/\s+/g, "") == 'нетвналичии' || 
        res[i].stock.toLowerCase().replace(/\s+/g, "") == 'outofstock' || 
        res[i].stock.toLowerCase().replace(/\s+/g, "") == 'ожидается' ?
        `<td class="bg-info">${res[i].stock}</td>` : `<td>${res[i].stock}</td>`}
        </tr>`
    })
}