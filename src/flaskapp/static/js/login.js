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

                    sessionStorage.setItem("nickname", nickname);
                    sessionStorage.setItem("email", email);
                    sessionStorage.setItem("thumbnail", thumbnail);

                    loginUser(nickname, email, thumbnail);
                },
                fail: function(error) {
                    console.log(error);
                }
            });
        },
        fail: function(error) {
            console.log(error);
        }
    });
});

$('#logout_btn').on('click', function() {
    sessionStorage.removeItem("nickname");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("thumbnail");

    Kakao.Auth.logout();
    logoutUser();
});

$( document ).ready(function() {
    let email=null, nickname=null, thumbnail=null;
    for(let i=0; i<sessionStorage.length; i++){
        let key = sessionStorage.key(i);
        if(key=="email") email = sessionStorage.getItem(key);
        else if(key=="nickname") nickname = sessionStorage.getItem(key);
        else if(key=="thumbnail") thumbnail = sessionStorage.getItem(key);
    }
    if(email !== null){
        loginUser(email, nickname, thumbnail);
    }
});


function loginUser(nickname, email, thumbnail){
    $("#user_profile").attr("src", thumbnail);
    $("#user_profile").removeClass("dis_none");
    $("#login_btn").addClass("dis_none");
    $("#logout_btn").removeClass("dis_none");

    // save infos in flask session
    $.ajax({
        type: "POST",
        url: "/save_user_info",
        data: { nickname: nickname, email: email, thumbnail:thumbnail }
    }).done(function( msg ) {
          // 로그인 완료
    });
}

function logoutUser(){
    $("#user_profile").addClass("dis_none");
    document.getElementById( "user_profile" ).src = "";

    $("#login_btn").removeClass("dis_none");
    $("#logout_btn").addClass("dis_none");

    // delete infos in flask session
    $.ajax({
        type: "POST",
        url: "/delete_user_info",
    }).done(function( msg ) {
          // 로그아웃 완료
    });
}
