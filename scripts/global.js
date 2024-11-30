//new design of loading spinner
var loading = `
<div class="loader" style="margin: 12px auto; filter: brightness(0) saturate(100%) invert(76%) sepia(27%) saturate(0%) hue-rotate(139deg) brightness(91%) contrast(81%);">
<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><style>@keyframes rotate{0%{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes fillunfill{0%{stroke-dashoffset:58.8}50%{stroke-dashoffset:0}to{stroke-dashoffset:-58.4}}@keyframes rot{0%{transform:rotate(0deg)}to{transform:rotate(-360deg)}}@keyframes colors{0%,to{stroke:#4285f4}}</style><g style="animation-duration:1568.63ms;animation-iteration-count:infinite;animation-name:rotate;animation-timing-function:linear;transform-origin:50% 50%;width:28px;height:28px"><path fill="none" d="M14 1.5A12.5 12.5 0 1 1 1.5 14" stroke-width="3" stroke-linecap="round" style="animation-duration:1333ms,5332ms,5332ms;animation-fill-mode:forwards;animation-iteration-count:infinite,infinite,infinite;animation-name:fillunfill,rot,colors;animation-play-state:running,running,running;animation-timing-function:cubic-bezier(.4,0,.2,1),steps(4),linear;transform-origin:50% 50%" stroke-dasharray="58.9" stroke-dashoffset="58.9"/></g></svg>
</div>`;
var isLoggedIn = false;
var loggingIn = true;
var cartLoading = true;

// handles XHR return, converts them from JSON to an object.
/**
 * XHR/Fetch response handler, can also convert a JSON response to an JS object
 * @param {*} data XHR/Fetch response
 * @param {String} type json/text
 * @param {boolean} logErrors Log errors into console if set to true
 * @returns Parsed object
 */
function responseHandler(data, type = "json", logErrors = true) {
    let response = {};
    response.hasErrors = false;
    if (type == "text") {
        response.data = data;
        return response;
    }
    else if (type == "json") {
        try {
            response.data = JSON.parse(data);
            return response;
        } catch (error) {
            if (logErrors) {
                console.error(error);
                console.error(data);
            }
            response.hasErrors = true;
            response.data = data;
            return response;
        }
    }
}

/**
 * Append raw HTML code into the website. Must be encapsulated by a HTML tag.
 * @param {Element} el 
 * @param {String} str 
 */
function appendHtml(el, str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    while (div.children.length > 0) {
        el.appendChild(div.children[0]);
    }
}

/**
 * Disable scrolling, but leaves the scroll bar visible to prevent page shifting
 */
function disablescroll() {
    var body = document.body,
    html = document.documentElement;
    var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

    if (height > window.innerHeight) {
        var scrollTop = document.documentElement.scrollTop;
        document.documentElement.classList.add("noscroll");
        document.documentElement.style.top = `-${scrollTop}px`;
    }
}

/**
 * Enable scrolling
 */
function enablescroll() {
    var scrollTop = parseInt(document.documentElement.style.top.slice(0, -2));
    document.documentElement.style.top = null;
    document.documentElement.classList.remove("noscroll");
    document.documentElement.scrollTop = -scrollTop;
}

// search and return count of occurences in a given string
// used in custom search
function occurrences(string, subString, allowOverlapping = false) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

/**
 * Custom popup message
 * @param {String} content Message content
 * @param {String} type cancelcontinue, cancelcontinuered, yesno, continue, close
 * @param {String} yes functionToRun()
 * @param {String} no functionToRun()
 * @param {String} style CSS styles
 */
function popupMessage(content = "", type = "continue", yes = "closePopupMessage();", no = " closePopupMessage();", style = "max-width: 400px; max-height: 200px;") {
    var popupWindow = `
    <div id="popup-backdrop">
        <div id="popup-window" style="${style}">
            <div class="popup-center">
                <div id="popup-message" class="popup-item-center"></div>
            </div>
        </div>
    </div>
    `;

    var response_cancel_continue = `
    <div id="popup-response" class="popup-center-bottom">
        <button class="button white-color popup-item-center" onclick="${no}">Cancel</button>
        <button class="button popup-item-center" onclick="${yes}">Continue</button>
    </div>
    `;

    var response_cancel_continue_red = `
    <div id="popup-response" class="popup-center-bottom">
        <button class="button white-color popup-item-center" onclick="${no}">Cancel</button>
        <button class="button red-color popup-item-center" onclick="${yes}">Continue</button>
    </div>
    `;

    var response_yes_no = `
    <div id="popup-response" class="popup-center-bottom">
        <button class="button white-color popup-item-center" onclick="${no}">No</button>
        <button class="button popup-item-center" onclick="${yes}">Yes</button>
    </div>
    `;

    var response_continue = `
    <div id="popup-response" class="popup-center-bottom">
        <button class="button popup-item-center" onclick="${yes}">Continue</button>
    </div>
    `;

    var response_close = `
    <div id="popup-response" class="popup-center-bottom">
        <button class="button popup-item-center" onclick="${yes}">Close</button>
    </div>
    `;

    var response_custom = type;

    var responseButton;
    switch (type) {
        case "cancelcontinue":
            responseButton = response_cancel_continue;
            break;
        case "cancelcontinuered":
            responseButton = response_cancel_continue_red;
            break;
        case "yesno":
            responseButton = response_yes_no;
            break;
        case "continue":
            responseButton = response_continue;
            break;
        case "close":
            responseButton = response_close;
            break;
    
        default:
            responseButton = response_custom;
            break;
    }

    // remove previous popup, if one exists
    if (document.getElementById("popup-backdrop") != null){
        document.getElementById("popup-backdrop").remove();
        enablescroll();
    }
    // shows a popup window with specified settings
    appendHtml(document.getElementById("site-container"), popupWindow);
    appendHtml(document.getElementById("popup-window"), responseButton);
    document.getElementById("popup-backdrop").classList.toggle("fadein");
    document.getElementById("popup-window").classList.toggle("zoomin");
    document.getElementById("popup-message").innerHTML = content;
    document.body.addEventListener('keyup', function(e) {
        if (e.key == "Escape") {
            closePopupMessage();
        }
    }, {once : true});
    disablescroll();
}

/**
 * Popup an image with the given link
 * @param {*} img 
 */
function popupImage(img) {
    var popupWindow = `
    <div id="popup-backdrop" class="img-backdrop" onclick="closePopupMessage()" style="background: rgba(0, 0, 0, 0.7);">
        <span class="close" onclick="closePopupMessage()"> </span>
        <img class="modal-content" src="${img.src}">
    </div>
    `;
    // remove previous popup, if one exists
    if (document.getElementById("popup-backdrop") != null){
        document.getElementById("popup-backdrop").remove();
        enablescroll();
    }
    // shows a popup window with specified settings
    appendHtml(document.getElementById("site-container"), popupWindow);
    document.getElementById("popup-backdrop").classList.toggle("fadein");
    disablescroll();

    //close image when esc is pressed
    document.getElementsByTagName("body")[0].focus();
    document.getElementsByTagName("body")[0].addEventListener("keyup", function(event) {
        if (event.key === "Escape") {
            enablescroll();
            closePopupMessage();
        }
    }, {once : true});
}

/**
 * Closes popup window
 */
function closePopupMessage(skipAnimation = false) {
    enablescroll();
    if (skipAnimation) {
        document.getElementById("popup-backdrop").remove();
        return;
    }
    setTimeout(() => {
        document.getElementById("popup-backdrop").remove();
    }, 500);
    if (document.getElementById("popup-backdrop") != null && document.getElementById("popup-backdrop").classList.contains("fadein")) {
        document.getElementById("popup-backdrop").classList.remove("fadein");
        document.getElementById("popup-backdrop").classList.toggle("fadeout");
    }
    if (document.getElementById("popup-window") != null && document.getElementById("popup-window").classList.contains("zoomin")) {
        document.getElementById("popup-window").classList.remove("zoomin");
        document.getElementById("popup-window").classList.toggle("zoomout");
    }
}

/**
 * Shows the Invalid Session popup. This function is called when token verification with server fails
 * @param {boolean} expired 
 */
function invalidSessionPopup(expired = false) {
    let invalid = `
    <h3>Invalid session</h3>You have been logged out. Please login again to continue.
    `;
    let expire = `
    <h3>Invalid session</h3>You have been logged out. Please login again to continue.
    `;
    popupMessage(expired? expire : invalid, "cancelcontinue", "location = '/login.html';", "location = '/techbanana.html';", "max-width: 400px; max-height: 200px;")
}

/**
 * Currency number formatter: RM 1,234.56
 * @param {String} number 
 * @returns 
 */
function currencyFormatter(number) {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency',
        currency: 'MYR', 
        currencyDisplay: "code" 
    })
    .format(number)
    .replace("MYR", "RM")
    .trim()
}

/**
 * Sort array by key
 * @param {Array} array 
 * @param {String} key 
 * @returns Sorted array
 */
function sortByKey(array, key) {
    return array.sort((a,b) => a[key] - b[key]);
}

/**
 * Sort array by key, reversed
 * @param {Array} array 
 * @param {String} key 
 * @returns Sorted array in reverse
 */
function sortByKeyReversed(array, key) {
    return array.sort((a,b) => b[key] - a[key]);
}

/**
 * Popup function for specific iframes: cart & login-frame
 * @param {String} elid element.ID
 */
function popup(elid) {
    if (cartLoading) {
        setTimeout(function(){
            //delays execution until login is finished
            popup(elid);
        }, 250);
    }
    else {
        setTimeout(() => {
            body.classList.add("blur");
        }, 250);
        if (elid == "cart-frame" && !isLoggedIn) elid = "login-frame";
        var frame = document.getElementById(elid);
        frame.style.display = "block";
        var body = document.getElementById("site-container");
        document.getElementById("popupbackdrop").classList.toggle("popup-backdrop");
        document.getElementById("popupbackdrop").classList.toggle("fadein");
        frame.classList.toggle("zoomin");
        var frame = `
        <button id="close" class="button" onclick="closePopup('${elid}');"></button>
        <iframe src="/frames/${elid == 'cart-frame' ? 'cart.html' : 'login.html'}" frameborder="0" width="100%" id="iframe" class="noblur" style="zoom: 1.20;"><p>Your browser does not support iframes.</p></iframe>
        `;
        appendHtml(document.getElementById(elid), frame);
        document.body.addEventListener('keyup', function(e) {
            if (e.key == "Escape") {
                closePopup(elid);
            }
        }, {once : true});
        //disable scroll
        disablescroll();
    }

}

/**
 * Closes iframe popup
 * @param {String} elid element.ID
 * @param {boolean} reload Reloads the page on close
 */
function closePopup(elid, reload = false) {
    var frame = document.getElementById(elid);
    frame.classList.toggle("zoomin");
    frame.classList.toggle("zoomout");
    document.getElementById("popupbackdrop").classList.toggle("fadein");
    document.getElementById("popupbackdrop").classList.toggle("fadeout");
    var body = document.body;
    body.classList.remove("blur");
    setTimeout(() => {
        frame.classList.toggle("zoomout");
        document.getElementById("popupbackdrop").classList.toggle("fadeout");
        document.getElementById("popupbackdrop").classList.toggle("popup-backdrop");
        frame.style.display = "none";
        var iframe = document.getElementById("iframe");
        iframe.remove();
        document.getElementById("close").remove();
        if (reload) {
            location.reload();
        }
    }, 500);

    // enable back scrolling
    enablescroll();    
}

/**
 * Adds item into cart. Can be configured to automatically popup cart or not after adding to cart. Function automatically retreives product ID from URL
 * @param {boolean} silent Shows cart window if set to false.
 * @returns 
 */
async function addCart(silent, prodID = parseInt(params.id), qty = parseInt(document.getElementById("qty-sel").value)) {
    if (cartLoading) {
        setTimeout(function(){
            //delays execution until login is finished
            addCart(silent);
        }, 250);
    }
    else {
        if (!isLoggedIn) {
            popup("login-frame");
            return;
        }
        var cartItems = sessionStorage.getItem("cartItems") == undefined ? [] : JSON.parse(sessionStorage.getItem("cartItems"));
        
        let added = 0;

        // check if item already exist in cart
        if (cartItems.length >= 1) {
            if (db.length == 0) db = await loadDB();
            for (let i = 0; i < cartItems.length; i++) {
                if (cartItems[i][0] == parseInt(params.id)) {
                    var prodIndex = prodID - 1
                    var dbQty = db[prodIndex].quantity;
                    cartItems[i][1] += qty;
                    if (cartItems[i][1] > dbQty) cartItems[i][1] = dbQty;
                    added++;
                    break;
                }
            }
        }
    
        // adds item to cart if it's not in cart yet
        if (added == 0) {
            cartItems.push([prodID, qty]);
        }
        // dave to sessionstorage and upload cart to cloud
        sessionStorage.setItem(`cartItems`, JSON.stringify(cartItems));
        uploadCartItems();
        if (!silent) popup('cart-frame');
        else checkout();
    }
}

/**
 * Updates the cart items when quantity is changed in cart popup menu.
 * @param {int} id 
 */
function updateCartItems(id) {
    var cartItems = JSON.parse(sessionStorage.getItem("cartItems"));
    if (cartItems.length >= 1) {
        for (let i = 0; i < cartItems.length; i++) {
            if (cartItems[i][0] == parseInt(id) && parseInt(document.getElementById(id).value) >= 1) {
                if (parseInt(document.getElementById(id).value) > parseInt(document.getElementById(id).max)) document.getElementById(id).value = parseInt(document.getElementById(id).max);
                cartItems[i][1] = parseInt(document.getElementById(id).value);
                break;
            }
            else if (cartItems[i][0] == parseInt(id) && parseInt(document.getElementById(id).value) == 0) {
                cartItems.splice(i, 1);
                break;
            }
        }
    }
    sessionStorage.setItem(`cartItems`, JSON.stringify(cartItems));
    uploadCartItems();
    reloadCart();
}

/**
 * Refreshes cart window
 */
function reloadCart() {
    cartLoad();
}

/**
 * Shows cart in table view. For use in cart popup only
 */
async function cartLoad() {
    if (db.length == 0) db = await loadDB();
    var cartItems = JSON.parse(sessionStorage.getItem("cartItems"));
    let grandTotal = 0;
    var cartGrid = document.getElementById("cart-list");
    document.getElementById("cart-list").innerHTML = "";
    if (cartItems != null && cartItems.length != 0) {
        for (let i = 0; i < cartItems.length; i++) {
            const prodId = cartItems[i][0] - 1;
            var thumbnailQuery = db[prodId].thumbnailQuery;
            var dbProdImage = db[prodId].thumbnailPath == "" ? `/assets/${(prodId + 1).toString().padStart(4, "0")}-001.jpg` : db[prodId].thumbnailPath + thumbnailQuery;
            var dbProdTitle = db[prodId].itemName;
            var dbPrice = currencyFormatter(parseFloat(db[prodId].promotion ? db[prodId].promoPrice : db[prodId].itemPrice));
            var dbQty = db[prodId].quantity;
            var amount = cartItems[i][1];
            var total = parseFloat(db[prodId].promotion ? db[prodId].promoPrice : db[prodId].itemPrice) * amount;
        
            var hProduct = `<div class="cart-grid-item"><div style="display: flex"><img src="${dbProdImage}" class="cart-thumb"><div class="cart-title name-no-overflow">${dbProdTitle}</div></div></div>`;
            var hUnitPrice = `<div class="cart-value">${dbPrice}</div>`;
            var hAmount = `<div class="amount"><button class="btn" id="minus" onclick="minus(${cartItems[i][0]});">-</button><input class="number-input" type="number" name="${cartItems[i][0]}" id="${cartItems[i][0]}" onchange="updateCartItems(${cartItems[i][0]});" min="0" max="${dbQty}" value="${amount}"><button class="btn" id="plus" onclick="plus(${cartItems[i][0]});">+</button></div>`;
            var hTotalPrice = `<div class="cart-value">${currencyFormatter(total)}</div>`;
            var hCheckBox = `<div class="cart-checkbox" class="clickable"><input type="checkbox" name="cart" class="accent-color"></div>`;
        
            grandTotal += total;

            appendHtml(cartGrid, `${hCheckBox}${hProduct}${hUnitPrice}${hAmount}${hTotalPrice}`);
        }
        var emptyDiv = `<div></div>`;
        appendHtml(cartGrid, emptyDiv);
        appendHtml(cartGrid, emptyDiv);
        appendHtml(cartGrid, emptyDiv);
        appendHtml(cartGrid, `<div class="cart-value">Total: </div>`);
        appendHtml(cartGrid, `<div class="cart-value" id="price">${currencyFormatter(grandTotal)}</div>`);
    }
    else document.getElementById("noresult").style.display = "block";
    document.getElementById("loading").style.display = "none";
}

/**
 * Load checkout page elements.
 */
async function checkoutLoad() {
    var db = await loadDB();
    //load addresses from cloud (async)
    let data = new FormData();
    data.append("token", localStorage.getItem("token"));
    data.append("uname", localStorage.getItem("acc"));
    post("/php/loadaddress.php", data).then(data => {
        let response = responseHandler(data);
        if (!response.hasErrors) {
            let defaults = 0;
            for (const iterator of response.data) {
                if (iterator.is_default == "true") defaults += 1;
            }
            if (defaults == 0) {
                console.warn("No default address selected! Using 1st address as display...");
                response.data[0].is_default = "true";
            }
            for (let i = 0; i < response.data.length; i++) {
                var rawhtml = `
                <div class="sel-list ${response.data[i].is_default == "true" ? "selected" : "hidden"}" onclick="checkOnClick(this)">
                    <span class="sel-head"><input type="radio" name="address" onchange="selectChange('address-select')" ${response.data[i].is_default == "true" ? "checked" : ""}>&nbsp;${response.data[i].address_name}</span>
                    <div class="sel"><img src="/assets/icons/pin_drop_FILL0_wght300_GRAD0_opsz20.svg" height="20px" alt="" srcset="" style="margin-right: 8px;">${response.data[i].street_name + ', ' + response.data[i].city + ', ' + response.data[i].state + ', ' + response.data[i].country}</div>
                    <div class="sel"><img src="/assets/icons/call_FILL0_wght300_GRAD0_opsz20.svg" height="20px" alt="" srcset="" style="margin-right: 8px;">${response.data[i].phone}</div>
                </div>
                `;
                appendHtml(document.querySelector(".address-select-wrapper"), rawhtml);
            }
            appendHtml(document.querySelector(".address-select-wrapper"), `<a class="sel-list hidden" href="/account/shippingaddress.html" style="margin-left: 8px;"><h3> + Add new address</h3></a>`);
        }
        else {
            appendHtml(document.querySelector(".address-select-wrapper"), `<a class="sel-list selected" href="/account/shippingaddress.html" style="margin-left: 8px;"><h3> + Add new address</h3></a>`);
        }
    });
    
    //load cards from cloud (async)
    post("/php/loadcard.php", data).then(data => {
        let response = responseHandler(data);
        if (!response.hasErrors) {
            let defaults = 0;
            for (const iterator of response.data) {
                if (iterator.is_default == "true") defaults += 1;
            }
            if (defaults == 0) {
                console.warn("No default card selected! Using 1st card as display...");
                response.data[0].is_default = "true";
            }
            for (let i = 0; i < response.data.length; i++) {
                let mm = response.data[i].expiry.slice(0, 2);
                let yy = response.data[i].expiry.slice(2, 4);
                let cardType = parseInt(response.data[i].cardType);
                let cardIcon = "";
                if (cardType == 3) cardIcon = `<img src="/assets/icons/americanexpress.png" height="16px" style="margin-right: 8px; transform: translateY(2px);">&nbsp;`;
                else if (cardType == 4) cardIcon = `<img src="/assets/icons/visa.png" height="16px" style="margin-right: 8px; transform: translateY(2px);">&nbsp;`;
                else if (cardType == 5) cardIcon = `<img src="/assets/icons/mastercard.png" height="16px" style="margin-right: 8px; transform: translateY(2px);">&nbsp;`;
                else if (cardType == 6) cardIcon = `<img src="/assets/icons/discover.png" height="16px" style="margin-right: 8px; transform: translateY(2px);">&nbsp;`;
                else cardIcon = `<img src="/assets/icons/credit_card_FILL0_wght300_GRAD0_opsz20.svg" alt="" height="20px" srcset="" style="margin-right: 8px; transform: translateY(2px);">`;
                var rawhtml = `
                <div class="sel-list ${response.data[i].is_default == "true" ? "selected" : "hidden"}" onclick="checkOnClick(this)">
                    <span class="sel-head"><input type="radio" name="card" onchange="selectChange('card-select')" ${response.data[i].is_default == "true" ? "checked" : ""}>&nbsp;${response.data[i].card_name}</span>
                    <div class="sel">${cardIcon}Ends in ${response.data[i].card_no}</div>
                </div>`;
                appendHtml(document.querySelector(".card-select-wrapper"), rawhtml);
            }
            appendHtml(document.querySelector(".card-select-wrapper"), `<a class="sel-list hidden" href="/account/payment.html" style="margin-left: 8px;"><h3> + Add new payment method</h3></a>`);
        }
        else {
            appendHtml(document.querySelector(".card-select-wrapper"), `<a class="sel-list selected" href="/account/payment.html" style="margin-left: 8px;"><h3> + Add new payment method</h3></a>`);
        }
    });

    //load everything in the cart
    var cartItems = JSON.parse(sessionStorage.getItem("cartItems"));
    let grandTotal = 0;
    let shipping = 0;
    let totalShipping = 0;
    var cartGrid = document.getElementById("checkout-prod-list");
    if (cartItems != null && cartItems.length != 0) {
        for (let i = 0; i < cartItems.length; i++) {
            const prodId = cartItems[i][0] - 1;
            var thumbnailQuery = db[prodId].thumbnailQuery;
            var dbProdImage = db[prodId].thumbnailPath == "" ? `/assets/${(prodId + 1).toString().padStart(4, "0")}-001.jpg` : db[prodId].thumbnailPath + thumbnailQuery;
            var dbProdTitle = db[prodId].itemName;
            var dbPrice = currencyFormatter(parseFloat(db[prodId].promotion ? db[prodId].promoPrice : db[prodId].itemPrice));
            var dbQty = db[prodId].quantity;
            var amount = cartItems[i][1];
            var total = parseFloat(db[prodId].promotion ? db[prodId].promoPrice : db[prodId].itemPrice) * amount;
            
            var hProduct = `<div class="cart-grid-item"><div style="display: flex"><img src="${dbProdImage}" class="cart-thumb"><div class="cart-title name-no-overflow">${dbProdTitle}</div></div></div>`;
            var hUnitPrice = `<div class="cart-value">${dbPrice}</div>`;
            var hAmount = `<div class="amount">${amount}</div>`;
            var hTotalPrice = `<div class="cart-value">${currencyFormatter(total)}</div>`;
            
            shipping += db[prodId].shippingFee;
            grandTotal += total + db[prodId].shippingFee;

            appendHtml(cartGrid, `<div class="cart-grid-row-wrapper">${hProduct}${hUnitPrice}${hAmount}${hTotalPrice}</div>`);
        }
        let emptyDiv = `<div></div>`;

        appendHtml(cartGrid, emptyDiv);
        appendHtml(cartGrid, `<div class="cart-value">Shipping: </div>`);
        appendHtml(cartGrid, emptyDiv);
        appendHtml(cartGrid, `<div class="cart-value">${currencyFormatter(shipping)}</div>`);
        appendHtml(cartGrid, emptyDiv);
        appendHtml(cartGrid, `<div class="cart-value">Total: </div>`);
        appendHtml(cartGrid, emptyDiv);
        appendHtml(cartGrid, `<div class="cart-value">${currencyFormatter(grandTotal)}</div>`);
    }
    else {
        popupMessage(`<span class="popup-header">No items in cart</span>You have no items in cart. Shop for a few items and come back to checkout later!`, "continue", `location = '/techbanana.html'`);
    }
    document.getElementById("loading").style.display = "none";
}

// allow trigerring radio buttons or checkboxes when the text beside it was pressed.
function checkOnClick(el) {
    //checks the radio when the text beside it is pressed and trigger a change event manually

    // new custom method
    checkboxClickArea(el.children[0].children[0]);

    // expands the div if collapsed
    let expandable = el.parentNode.firstElementChild;
    if (!expandable.classList.contains("expanded")) expandable.firstElementChild.dispatchEvent(new Event('click'));
}

//changes selected class so it hides properly
function selectChange(el) {
    let unchecked = Array.from(document.getElementById(el).querySelectorAll("input[type=radio]"));
    let checked;
    let removeIndex;
    for (let i = 0; i < unchecked.length; i++) {
        if (unchecked[i].checked) {
            checked = unchecked[i];
            removeIndex = i;
        }
    }
    unchecked.splice(removeIndex, 1);
    checked.parentElement.parentElement.classList.add("selected");
    for (const element of unchecked) {
        if (element.parentElement.parentElement.classList.contains("selected")) element.parentElement.parentElement.classList.remove("selected");
    }
}

// checkout page div smooth transition
function expand(el) {
    //expand button animation
    document.getElementById(el).querySelector(".expand").classList.toggle("expanded");

    //div expand animation
    let oHeight = document.getElementById(el).clientHeight;
    var target = document.getElementById(el).querySelectorAll(".sel-list");
    for (const key of target) {
        if (!key.classList.contains("selected")) key.classList.toggle("hidden");
    }
    let dHeight = document.getElementById(el).querySelector(`.${el}-wrapper`).clientHeight;
    if (oHeight > dHeight) oHeight -= 16; //animation offset because clientHeight under-reports
    document.getElementById(el).style.height = `${oHeight}px`;
    
    setTimeout(() => {
        document.getElementById(el).style.height = `${dHeight}px`;
    }, 1);
}

// product page quantity check to make sure it's in range
function rangeCheck(id) {
    if (parseInt(document.getElementById(id).value) > parseInt(document.getElementById(id).max)) document.getElementById(id).value = parseInt(document.getElementById(id).max);
    if (parseInt(document.getElementById(id).value) < parseInt(document.getElementById(id).min)) document.getElementById(id).value = 1;
}

// saves the searchbox text into session storage so it displays across page
function updateQuery(el) {
    if (el.value == "") sessionStorage.setItem("query", "");
}

function checkout() {
    window.location.href = "/checkout.html";
}

// hide/show filter menu on small screens
function toggleFilterMenu() {
    if (document.getElementById("filter").style.display == "block") document.getElementById("filter").style.display = null;
    else document.getElementById("filter").style.display = "block";
}

// FAQ page feedback yes no buttons
function feedback(happy) {
    happy ? document.getElementById("feedback").innerHTML = "<nobr>Thank you for your feedback. :)</nobr>" : document.getElementById("feedback").innerHTML = "<nobr>Thank you for your feedback.</nobr>";
}

// product page change main image
function changeImage(src, el) {
    document.getElementById("img").src = src;
    for (const element of document.getElementsByName("imgroll")) {
        if (element.classList.contains("selected")) element.classList.remove("selected");
    }
    el.classList.add("selected");
}

async function post(url, data) {
    const response = await fetch(url, {
        method: "POST", 
        // headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
        body: data
    });
    return response.text();
}

async function get(url) {
    const response = await fetch(url, {
        method: "GET"
    });
    return response.text();
}

function login(inframe = false) {
    document.getElementById("response").innerHTML = loading;
    let data = new FormData();
    data.append("uname", document.getElementById("username").value);
    data.append("pw", document.getElementById("password").value);
    let url = "/php/login.php";
    post(url, data).then(data => {
        let response = data;
        if (response.substring(0,2) == "T-") {
            localStorage.setItem("acc", document.getElementById("username").value);
            localStorage.setItem("token", response.split('-')[1]);
            retrieveCartData();
            isLoggedIn = true;
            if (inframe) parent.closePopup('login-frame', true);
            else location = "/techbanana.html";
        }
        else {
            console.error(response); 
            document.getElementById("response").innerHTML = response;
        }
    });
}

function logout(redirectUrl = "") {
    let data = new FormData();
        data.append("token", localStorage.getItem("token"));
        data.append("uname", localStorage.getItem("acc"));
        post("/php/logout.php", data).then(data => {
            let response = data;
            if (response != "") console.error(response);
        });
        localStorage.removeItem("acc");
        localStorage.removeItem("token");
        isLoggedIn = false;
        if (redirectUrl != "") location = redirectUrl;
        else location.reload();
}

async function retrieveCartData() {    
    let cartdata = new FormData();
    cartdata.append("uname", localStorage.getItem("acc"));
    cartdata.append("token", localStorage.getItem("token"));
    post("/php/loadcart.php", cartdata).then(data => {
        let response = data;
        if (response.substring(0,2) == "C-") {
            sessionStorage.setItem("cartItems", (response.split('-')[1]));
            console.log("Cart loaded");
        }
        else {
            console.warn(response);
            sessionStorage.removeItem("cartItems");
        }
        cartLoading = false;
    });
}

function uploadCartItems() {
    let cartdata = new FormData();
    cartdata.append("uname", localStorage.getItem("acc"));
    cartdata.append("token", localStorage.getItem("token"));
    cartdata.append("cart", sessionStorage.getItem("cartItems") == null ? [] : sessionStorage.getItem("cartItems"));
    post("/php/savecart.php", cartdata).then(data => {
        let response = data;
        if (response != "") console.error(response);
    });
}

function signup() {
    document.getElementById("response").innerHTML = loading;
    if (document.getElementById("username").value == "" || document.getElementById("fname").value == "" || document.getElementById("lname").value == "" || document.getElementById("tel").value == "" || document.getElementById("email").value == "" || document.getElementById("pw").value == "" || document.getElementById("pwc").value == "" || !document.getElementById("tc").checked) document.getElementById("response").innerHTML = "One or more fields are empty.";
    else if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(document.getElementById("email").value)) {
        document.getElementById("response").innerHTML = "Invalid Email address.";
    }
    else if (document.getElementById("pw").value != document.getElementById("pwc").value) document.getElementById("response").innerHTML = "Passwords do not match.";
    else {
    
        document.getElementById("response").innerHTML = loading;
        let data = new FormData();
        data.append("uname", document.getElementById("username").value);
        data.append("fname", document.getElementById("fname").value);
        data.append("lname", document.getElementById("lname").value);
        data.append("tel", document.getElementById("tel").value);
        data.append("email", document.getElementById("email").value);
        data.append("pw", document.getElementById("pw").value);

        post("/php/signup.php", data).then(data => {
            let response = data;
            if (response != "") console.error(response); 
            document.getElementById("response").innerHTML = response;
            if (response == "") location = "/usercreated.html";
        });
        
    }
}

function update_acc_status(redirectHomeIfFail = false) {
    loggingIn = true;
    let acc = localStorage.getItem("acc");
    let token = localStorage.getItem("token");
    if (acc != null && acc != "" && token != null && token != "") {
        let data = new FormData();
        data.append("uname", acc);
        data.append("token", token);
        post("/php/tokencheck.php", data).then(data => {
            let response = data;
            if (response == "") {
                document.getElementById("acc").innerText = acc;
                document.getElementById("login").innerText = "Logout";
                console.log("Signed in");
                if (!redirectHomeIfFail) retrieveCartData();
                isLoggedIn = true;
                loggingIn = false;
            }
            else {
                document.getElementById("acc").innerText = "Sign up";
                document.getElementById("login").innerText = "Login";
                console.error(response);
                localStorage.removeItem("acc");
                localStorage.removeItem("token");
                sessionStorage.removeItem("cartItems");
                isLoggedIn = false;
                loggingIn = false;
                cartLoading = false;
                if (response == "Session Expired!") invalidSessionPopup(true);
                else invalidSessionPopup();
            }
        })
    }
    else {
        document.getElementById("acc").innerText = "Sign up";
        document.getElementById("login").innerText = "Login";
        localStorage.removeItem("acc");
        localStorage.removeItem("token");
        sessionStorage.removeItem("cartItems");
        isLoggedIn = false;
        loggingIn = false;
        cartLoading = false;
        if (redirectHomeIfFail) location = "/techbanana.html";
    }
}

function login_logout(isPopupSupported = false) {
    if (loggingIn) {
        setTimeout(function(){
            //delays execution until login is finished
            login_logout(isPopupSupported);
        }, 250);
    }
    else {
        if(isLoggedIn) {
            logout();
        }
        else {
            // location = "/login.html";
            if (!isPopupSupported) location = "/login.html";
            else popup('login-frame');
        }
    }

}

function account() {
    if (loggingIn) {
        setTimeout(function(){
            //delays execution until login is finished
            account();
        }, 250);
    }
    else {
        if (isLoggedIn) {
            location = "/account/personalinfo.html";
        }
        else location = "/signup.html";
    }
}

function checkboxClickArea(checkboxElement, fireEvents = true) {
    //checks radio button on click, toggles checkbox on click
    if (checkboxElement.type == "radio") checkboxElement.checked = true;
    else if (checkboxElement.type == "checkbox") checkboxElement.checked = !checkboxElement.checked;
    if (fireEvents) checkboxElement.dispatchEvent(new Event('change'));
}

function checkoutContinue() {
    let addressRadios = document.querySelectorAll("input[type=radio][name=address]");
    let cardRadios = document.querySelectorAll("input[type=radio][name=card]");
    let hascheckedAddress = false;
    let hascheckedCard = false;
    for (const key of addressRadios) {
        if (key.checked) hascheckedAddress = true;
    }
    for (const key of cardRadios) {
        if (key.checked) hascheckedCard = true;
    }
    if (hascheckedAddress && hascheckedCard) verifyCard();
    else popupMessage(`<span class="popup-header">Incomplete form</span><br>One or more required fields are not selected.`, "continue");
}

function verifyCard() {
    let customMessage = `<span class="popup-header">Verify card</span>
    <div style="display: grid; grid-template-columns: max-content auto; margin-top: 0px;">
        <div style="padding: 4px;">CVV: </div><input type="password" maxlength="3" id="cvv" style="border-radius: 5px; border: 1px solid #ccc; padding: 4px; margin: 2px; max-width: 30px;">
    </div><div id="response" style="text-align: center; color: #d00000"></div>
    `;
    let customAction = `
    <div id="popup-response" class="popup-center-bottom">
        <button class="button white-color popup-item-center" onclick="closePopupMessage();">Cancel</button>
        <button class="button popup-item-center" onclick="verifyCardFail();">Continue</button>
    </div>`;
    let customMessageFrame = `<div id="customMessageFrame"><div style="margin-top: 60px;">${loading}</div></div>`;
    let customActionFrame = `<div id="customActionFrame"></div>`;
    popupMessage(customMessageFrame, customActionFrame, "", "", "max-width: 300px; max-height: 200px;");
    setTimeout(function(){
        document.getElementById("customMessageFrame").innerHTML = customMessage;
        document.getElementById("customActionFrame").innerHTML = customAction;
        document.getElementById("cvv").addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                verifyCardFail();
            }
        }, {once : true});
    }, disable_artificial_loading ? 0 : Math.floor((Math.random() * 800) + 500));
}

function verifyCardFail() {
    closePopupMessage(true);
    popupMessage(`<span class="popup-header">Verifying card</span>${loading}`, "", "", "", "max-width: 300px; max-height: 200px;");
    setTimeout(() => {
        closePopupMessage(true);
        popupMessage(`<span class="popup-header">Transaction canceled</span>We are unable to verify the selected card right now. Please try again later.`, `continue`);
    }, disable_artificial_loading ? 0 : Math.floor((Math.random() * 800) + 4500));

}

function dynamicInputChecker(el, type) {
    if (type == "pw") checkpassword(el.value);
    if (type == "uname") ;
    if (type == "email") ;
}

function checkpassword(password) {
    var tinydisplay = document.getElementById("tinypwdisplay");
    var strength = 0;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    if (password.match(/[!@#$%^&*]+/)) strength += 1;

    switch (strength) {
    case 0:
        tinydisplay.innerHTML = `Password strength: <span style="color: #d00000">Very weak</span>`;
        break;

    case 1:
        tinydisplay.innerHTML = `Password strength: <span style="color: #d06000">Weak</span>`;
        break;

    case 2:
        tinydisplay.innerHTML = `Password strength: <span style="color: #d0c900">Average</span>`;
        break;

    case 3:
        tinydisplay.innerHTML = `Password strength: <span style="color: #00d000">Strong</span>`;
        break;

    case 4:
        tinydisplay.innerHTML = `Password strength: <span style="color: #00d000">Very strong</span>`;
        break;
    }
    
    if (password.length < 6) {
        tinydisplay.innerHTML = `<span style="color: #d00000">Minimum number of characters is 6</span>`;
    }
}

function feedbackPopup() {
    //require sign in
    if (!isLoggedIn) return;
    //popup
    let customMessage = `<span class="popup-header">Feedback</span>
    <input class="textarea" type="text" placeholder="Title" id="fbTitle" style="width: 100%;"><br>
    <textarea class="textarea largetextarea" placeholder="Your feedback" id="fbContent"></textarea>
    <div id="response" style="text-align: center; color: #d00000">
    <div>
    `;
    let customMessageFrame = `<div id="customMessageFrame" style="width: 420px; padding-right: 12px;"><div style="margin-top: 100px; width: 520px;">${loading}</div></div>`;
    popupMessage(customMessageFrame, "cancelcontinue", "feedbackSubmittedPopup()", "closePopupMessage()", "max-width: 500px; max-height: 360px;");
    setTimeout(function(){
        document.getElementById("customMessageFrame").innerHTML = customMessage;
    }, disable_artificial_loading ? 0 : Math.floor((Math.random() * 400) + 300));
    
}

function feedbackSubmittedPopup() {
    let data = new FormData();
    data.append("uname", localStorage.getItem("acc"));
    data.append("token", localStorage.getItem("token"));
    data.append("fbTitle", document.getElementById("fbTitle").value);
    data.append("fbContent", document.getElementById("fbContent").value);
    post("/php/feedback.php", data).then(data => {
        let response = data
        if (response == "") {
            popupMessage(`<span class="popup-header">Feedback</span>Thank you for your feedback! You can now close this window.`, "close");
        }
        else {
            document.getElementById("response").innerHTML = response;
            
        }
    });
}

window.addEventListener("resize", () => {
    if (document.getElementById("acc") != null) document.getElementById("acc").style.maxWidth = `${innerWidth - 180}px`;
});
if (document.getElementById("acc") != null) document.getElementById("acc").style.maxWidth = `${innerWidth - 180}px`;
