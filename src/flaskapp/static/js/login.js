Kakao.init( "3634d739399c9436fa103280f8e6cb34" );

$( document ).ready(function() {
    let cookie = document.cookie;
    if (cookie.includes("email")){
        cookie = parseCookieString();
        console.log(cookie);
        loginUser(cookie["nickname"] , cookie["email"], cookie["thumbnail"]);
        return;
    }
    Kakao.Auth.createLoginButton({
        container : "#login_btn",
        success : function( authObj ) {
            Kakao.API.request({
                url : "/v2/user/me"
                , success : function( res ) {
                    let nickname = res.properties.nickname;
                    let email = res.kakao_account.email;
                    let thumbnail = res.properties.thumbnail_image;
                    loginUser(nickname, email, thumbnail);
                }, fail : function( error ) {
                    alert( JSON.stringify( error ) );
                }
            });
        }
        , fail : function( error ) {
            alert( JSON.stringify( error ));
        }
    });

    $("#kakao-login-btn").attr("src", "");
    $("#login_btn").html("Login");
});

function loginUser(nickname, email, thumbnail){
    document.getElementById( "user_profile" ).src = thumbnail;
    $("#user_profile").removeClass("dis_none");
    $("#login_btn").addClass("dis_none");
    $("#logout_btn").removeClass("dis_none");

    if (email !== "") {
        document.cookie = `nickname=${nickname}`;
        document.cookie = `email=${email}`;
        document.cookie = `thumbnail=${thumbnail}`;
    }
}

function parseCookieString(){
    let cookie_obj = {};
    let semi_parsed = document.cookie.split(';');
    $.each(semi_parsed, function(index, item){
        let stripped = $.trim(item);
        let value_dict = stripped.split("=");
        let key = value_dict[0];
        let value = value_dict[1];
        cookie_obj[key] = value;
    });
    return cookie_obj;
}

$('#logout_btn').on('click', function() {
    let cookie = parseCookieString();
    delete cookie["nickname"];
    delete cookie["email"];
    delete cookie["thumbnail"];
    document.getElementById( "user_profile" ).src = "";
    $("#user_profile").addClass("dis_none");
    $("#login_btn").removeClass("dis_none");
    $("#logout_btn").addClass("dis_none");

    Kakao.Auth.logout(() => {
        this.setState({
            isLogin: false
        })
    });
});