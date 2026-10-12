/* =========================================================
   OLYMPIC HSG ONLINE
   HỆ THỐNG THEO DÕI HỌC SINH ONLINE
   ========================================================= */

(function(){

    const API_URL =
        "https://script.google.com/macros/s/AKfycbzXRtrvbS2YpKDAZLwoV0cR1mFWHxlXljvNJzryHhFmnfOXZ3LzR0ai1cyltOF7l62hVQ/exec";


    const INTERVAL =
        45 * 1000;


    function layMaHS(){

        const keys = [
            "maThiSinh",
            "maHS",
            "MaHS",
            "studentCode"
        ];

        for(
            const key of keys
        ){

            const value =
                localStorage.getItem(key);

            if(
                value &&
                String(value).trim()
            ){

                return String(
                    value
                ).trim();

            }

        }


        /*
         * Kiểm tra object học sinh
         */

        const objects = [
            "hocSinh",
            "currentUser",
            "user",
            "studentInfo"
        ];


        for(
            const key of objects
        ){

            try{

                const obj =
                    JSON.parse(
                        localStorage.getItem(key) || ""
                    );


                const ma =
                    obj?.maHS ||
                    obj?.MaHS ||
                    obj?.maHocSinh ||
                    obj?.studentCode;


                if(
                    ma &&
                    String(ma).trim()
                ){

                    return String(
                        ma
                    ).trim();

                }

            }catch(e){}

        }


        return "";

    }


    function capNhatOnline(){

        const maHS =
            layMaHS();


        if(!maHS){
            return;
        }


        if(
            !API_URL ||
            API_URL ===
            "DAN_URL_WEB_APP_APPS_SCRIPT_VAO_DAY"
        ){

            console.warn(
                "Chưa cấu hình API_URL online."
            );

            return;

        }


        const payload = JSON.stringify({

            action:
                "capNhatOnlineHS",

            data: {

                maHS: maHS

            }

        });


        /*
         * sendBeacon giúp gửi được cả
         * khi người dùng đóng/chuyển trang.
         */

        try{

            if(
                navigator.sendBeacon
            ){

                const blob =
                    new Blob(
                        [payload],
                        {
                            type:
                                "text/plain;charset=UTF-8"
                        }
                    );

                navigator.sendBeacon(
                    API_URL,
                    blob
                );

            }else{

                fetch(
                    API_URL,
                    {
                        method:"POST",

                        headers:{
                            "Content-Type":
                                "text/plain;charset=UTF-8"
                        },

                        body:payload,

                        keepalive:true
                    }
                ).catch(
                    ()=>{}
                );

            }

        }catch(e){

            console.warn(
                "Không cập nhật được online:",
                e
            );

        }

    }


    /*
     * Gửi ngay khi mở trang
     */

    capNhatOnline();


    /*
     * Cứ 45 giây cập nhật một lần
     */

    setInterval(
        capNhatOnline,
        INTERVAL
    );


    /*
     * Khi quay lại tab
     */

    document.addEventListener(
        "visibilitychange",
        function(){

            if(
                document.visibilityState ===
                "visible"
            ){

                capNhatOnline();

            }

        }
    );


})();