Kakao.init( "3634d739399c9436fa103280f8e6cb34" );


$('#login_btn').on('click', function(){
    Kakao.Auth.login({
        scope: 'account_email,profile',
        success: function(response) {
            let access_token = response["access_token"];

            Kakao.API.request({
                url: '/v2/user/me',
                success: function(response) {
                    let profile = response["kakao_account"];
                    let email = profile["email"];
                    let nickname = profile["profile"]["nickname"];
                    let thumbnail = profile["profile"]["thumbnail_image_url"];

                    localStorage.setItem("nickname", nickname);
                    localStorage.setItem("email", email);
                    localStorage.setItem("thumbnail", thumbnail);

                    loginUser(nickname, email, thumbnail);
                },
                fail: function(error) {
                    alert("오류가 발생했습니다.");
                    console.log(error);
                }
            });
        },
        fail: function(error) {
            alert("오류가 발생했습니다.");
            console.log(error);
        }
    });
});

$( document ).ready(function() {
    const email = localStorage.getItem('email');
    const nickname = localStorage.getItem('nickname');
    const thumbnail = localStorage.getItem('thumbnail');

    if (email) {
        showLoggedIn(thumbnail);
    }
});

function showLoggedIn(thumbnail) {
    $("#user_profile").attr("src", thumbnail);
    $("#user_profile").removeClass("dis_none");
    $("#login_btn").addClass("dis_none");
    $("#logout_btn").removeClass("dis_none");
}

$('#logout_btn').on('click', function() {
    localStorage.clear();

    Kakao.Auth.logout();
    logoutUser();
});

function loginUser(nickname, email, thumbnail){
    showLoggedIn(thumbnail);

    const docid = getDocID();
    let user_cookie = getCookie("code-live");
    let login = check_if_login;

    // save infos in flask session
    $.ajax({
        type: "POST",
        url: "/api/save_user_info",
        data: { nickname : nickname, email : email, thumbnail :thumbnail,
            docid: docid, user_cookie: user_cookie, login :login }
    }).done(async function( msg ) {
        // 로그인 완료

        // Reattach document so that other peers can be notified of the user's login
        await client.detach(doc);
        await client.attach(doc);

        refreshPeers();
        chat.initName();
    });
}

function logoutUser(){
    $("#user_profile").addClass("dis_none");
    document.getElementById( "user_profile" ).src = "";

    $("#login_btn").removeClass("dis_none");
    $("#logout_btn").addClass("dis_none");

    let docid = getDocID();
    let user_cookie = getCookie("code-live");

    // delete infos in flask session
    $.ajax({
        type: "POST",
        url: "/api/delete_user_info",
        data: { doc_id: docid, user_cookie: user_cookie, login: false}
    }).done(async function( msg ) {
        // 로그아웃 완료
        await client.detach(doc);
        await client.attach(doc);

        refreshPeers();
    });
}
