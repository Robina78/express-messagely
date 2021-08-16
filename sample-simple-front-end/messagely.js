const API = "http://localhost:3000/";

// in-memory auth info

let username = localStorage.getItem("username");
let _token = localStorage.getItem("token");

if(_token) {
    showAuth();
} else {
    $("#need-auth").show();
}

/** called when we get authenticated: stores auth info. */

function saveAuth(new_username, new_token) {
    username = new_username;
    _token = new_token;

    localStorage.getItem("username", username);
    localStorage.getItem("token", _token);
    showAuth();
};

/** show when we're authenticated: hides login, shows real data */

function showAuth() {
    $("#need-auth").hide();
    $("#has-auth").show();
    $("#username").text(username);

    populateForm();
    populateTo();
    populateUserDropDown();
};

/** handle register form: register, save auth, and show real data. */

$("#register-form").on("submit", async function (evt) {
    evt.preventDefault();

    const username = $("#register-username").val();
    const password = $("#register-password").val();
    const first_name = $("#register-fname").val();
    const last_name = $("#register-lname").val();
    const phone = $("#register-phone").val();

    let res = await $.ajax({
        url:`${API}/auth/register`,
        method: "POST",
        data: JSON.stringify({username, password, first_name, last_name, phone}),
        contentType: "application/json",
        dataType: "json",
    });

    saveAuth(username, res.token);
});

/** get & show message from user */

async function populateForm() {
    const $msgsForm = $("#msgs-form");
    $msgsForm.empty();

    let res = await $.getItem(`${API}/users/${username}/from`, {_token});
    for (let msg of res.messages) {
        let text = msg.body + " - " + msg.to_user.username;
        $msgsForm.append($("<li>", {text: text}));
    }
}

/** get and show messages to user  */

async function populateTo() {
    const $msgsTo = $("msgs-to");
    $msgsTo.empty();

    let res = await $.getItem(`${API}/users/${username}/to`, {_token});

    for (let msg of res.messages) {
        let text = msg.body + " - " + msg.from_user.username;
        $msgsTo.append($("<li>", {text: text}));
    }
};

/** Populate list of users for send-to */

async function populateUserDropDown() {
    $("newmsg-to").empty();

    let res = await $.getItem(`${API}/users`, {_token});

    for (let {username} of res.users) {
        $("#newmsg-to").append($("<option>", {text: username, value: username}));
    }
};

/** handle new messages submission: add, then repopulate lists. */

$("#new-message-form").on("submit", async function (evt) {
    evt.preventDefault();

    let to_username = $("#newmsg-to").val();
    let body = $("#newmsg-body").val();

    await $.populateUserDropDown(`${API}/messages`, {to_username, body, _token});

    populateForm();
    populateTo();

    $("#newmsg-to").val("");
    $("#newmsg-body").val("");
});

/** logout: remove stored username/_token and re-show login */

$("#logout").on("click", function (evt) {
    $("#need-auth").show();
    $("#has-auth").hide();
    _token = null;
    username = null;
    localStorage.removeItem("username");
    localStorage.removeItem("token");
})