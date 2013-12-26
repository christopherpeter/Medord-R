
document.addEventListener('deviceready', main, false);
document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown() {
    // Handle the back button
}


function main() {
    //alert('main');

    var MD = new Array();
    var InCompletemgs = new Array();
    var db = openDatabase('Medord_R', '1.0', 'Medord_R', 2 * 1024 * 1024);
    db.transaction(function (tx) {
        //tx.executeSql('drop TABLE  MessageContent');
        //tx.executeSql('drop TABLE  OrderDetails');
        tx.executeSql('CREATE TABLE IF NOT EXISTS MessageContent (id INTEGER PRIMARY KEY AUTOINCREMENT,Recid VARCHAR(30) UNIQUE,Smscontent,StatusDelivery,Mobileno,status)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS OrderDetails (ordID INTEGER PRIMARY KEY AUTOINCREMENT,msgid,orddetails,time)');

        cordova.exec(function (winParam) {

            for (var i = 0; i < winParam.texts.length; i++) {


                if (winParam.texts[i].message.substring(0, 2) == "MD") {
                    var Messages = winParam.texts[i].message;
                    MD.push(Messages);
                }
            }
            var incompletefirstmsg = new Array();
            for (var i = 0; i < MD.length; i++) {

                // Getting last character from the msg

                var mymsg = MD[i];

                // Check the msg should contain word 'Delivery' and not 'More'

                // If the below condition is satisfied then it must be complete message

                if (mymsg.indexOf('More') == -1 && mymsg.indexOf('Delivery') > -1) {

                    var smsg = MD[i];
                    // Removeing: {1} from message

                    var msg20 = smsg.slice(-3);

                    var msg10 = smsg.replace(msg20, "");
                    var arr1 = new Array();
                    arr1 = msg10.split(":");
                    //alert(arr1);
                    var arr2 = new Array();
                    arr2 = arr1[0].split("MD");
                    var MSGID1 = arr2[1];            // message id
                    //alert("Message Id:" + MSGID1);
                    var arr3 = new Array();
                    arr3 = arr1[3].split("Time");
                    var deliveyday1 = arr3[0];        // Delivery day
                    //alert("Deliveryday:" + deliveyday1);
                    var arr4 = new Array();
                    //alert(arr1[0]);
                    var xx = arr1[0] + ":";
                    var smscontent1 = msg10.replace(xx, ""); // smscontent
                    //alert("smscontent:" + smscontent1);
                    //var number1 = "";


                    for (var l = 0; l < winParam.texts.length; l++) {
                        //alert('L:' + l);
                        var numbermsg = winParam.texts[l].message
                        if (numbermsg.indexOf(MSGID1) > -1) {

                            var number1 = winParam.texts[l].number;

                            var timereceived = winParam.texts[l].time_received;
                            //converting Unix time format to normal time
                            var unix_timestamp = timereceived;
                            var date = new Date(unix_timestamp * 1000);
                            var hours = date.getHours();
                            var minutes = date.getMinutes();
                            var seconds = date.getSeconds();
                            var formattedTime = hours + ':' + minutes + ':' + seconds;
                        }
                    }

                    // alert("Timereceived:" + formattedTime);
                    //alert("CompleteMsg:"+MSGID);
                    //alert("Initial Push :" + smscontent1);
                    // code to insert msg into DB
                    tx.executeSql('INSERT OR IGNORE INTO MessageContent (Recid,Smscontent,StatusDelivery,Mobileno) VALUES ("' + MSGID1 + '","' + smscontent1 + '","' + deliveyday1 + '","' + number1 + '")');


                }

                else {

                    //Storing all incomplete message into array

                    var smsg = MD[i];
                    incompletefirstmsg.push(smsg);
                }
            }

            var InCompletemgs = new Array();
            for (var i = 0; i < incompletefirstmsg.length; i++) {
                var mymsg1 = incompletefirstmsg[i];

                // Check the msg should contain both word 'Delivery' and  'More'

                if (mymsg1.indexOf('More') > -1 && mymsg1.indexOf('Delivery') > -1) {
                    // Pushing the First Message of Order into array 

                    InCompletemgs.push(mymsg1);
                }
            }
            var msgwithsameid = new Array();
            var msgwithsameidsorted = new Array();
            // Combining all incomplete messages with commom Sec ID

            for (var i = 0; i < InCompletemgs.length; i++) {


                var secidmsg = InCompletemgs[i];

                var arrname1 = new Array();
                arrname1 = secidmsg.split(':');

                var secid = new Array();
                secid = arrname1[0].split("MD");

                // Getting Random Secret id from incomplete msg

                var msgsecid = secid[1];

                // Filtering the incomplete msgs array with msgcid
                var k = 0;

                msgwithsameid.splice(0, msgwithsameid.length); // clearing array
                msgwithsameidsorted.splice(0, msgwithsameidsorted.length);

                for (var j = 0; j < incompletefirstmsg.length; j++) {

                    var fidgmsg = incompletefirstmsg[k];

                    if (fidgmsg.indexOf(msgsecid) > -1) {
                        msgwithsameid.push(fidgmsg);
                    }

                    var k = k + 1;
                }
                //alert(JSON.stringify(msgwithsameid));
                if (msgwithsameid.length > 0) {
                    var MSGID = "";
                    var smscontent = "";
                    var number = "";
                    var deliveyday = "";


                    var finalarray = new Array();
                    var split1 = new Array();
                    var storemsg = new Array();

                    for (var z = 0; z < msgwithsameid.length; z++) {

                        for (var m = 0; m < msgwithsameid.length; m++) {

                            var msgpage = msgwithsameid[m].slice(-2, -1);



                            if (msgpage == (z + 1)) {
                                msgwithsameidsorted.push(msgwithsameid[m]);
                            }

                        }

                    }


                    finalarray = msgwithsameidsorted;


                    // alert(JSON.stringify(finalarray));

                    var z = "";
                    for (var x = 0; x < finalarray.length; x++) {

                        var getmsg = finalarray[x];

                        if (x == 0) {
                            // Removing More{1} from the First Message
                            //alert("Firstmsg:" + finalarray[x]);
                            split1 = finalarray[x].split('Delivery Day');
                            var header = split1[0];
                            //alert(JSON.stringify(split1));
                            var lastWord = finalarray[x].slice(-8);
                            // alert(lastWord);
                            var msg10 = finalarray[x].replace(lastWord, "");
                            z = msg10;
                            //alert("1: " + z);
                        }
                        else if (x == finalarray.length - 1) {
                            // Removing Userdetail and {n} from the First Message

                            var firsttext = finalarray[x].substring(header.length - 1, finalarray[x].length);
                            //alert("after:" + firsttext);
                            //var firsttext = finalarray[x].replace(header, "");
                            var msg20 = firsttext.slice(-3);
                            var msg1 = firsttext.replace(msg20, "");
                            z = z + msg1;
                            // alert("2: " + z);
                        }
                        else {
                            // Removing Userdetail and More{n-1} from the First Message

                            var firsttext = finalarray[x].substring(header.length - 1, finalarray[x].length);
                            var msg30 = firsttext.slice(-8);
                            var msg2 = firsttext.replace(msg30, "");

                            z = z + msg2;
                            //alert("3: " + z);
                        }


                    }

                    var finalcompletemsg = z;
                    //alert(finalcompletemsg);

                    var arr11 = new Array();
                    arr11 = finalcompletemsg.split(":");
                    //alert(arr1);
                    var arr12 = new Array();
                    arr12 = arr11[0].split("MD");
                    MSGID = arr12[1];             // message id
                    //alert("Message Id:" + MSGID);
                    var arr13 = new Array();
                    arr13 = arr11[3].split("Time");
                    deliveyday = arr13[0];        // Delivery day
                    //alert("Deliveryday:" + deliveyday);


                    var xx = arr11[0] + ":";
                    //alert(xx);
                    smscontent = finalcompletemsg.replace(xx, ""); // smscontent

                    //alert("Smscontent:" + smscontent);

                    for (var l = 0; l < winParam.texts.length; l++) {
                        var numbermsg = winParam.texts[l].message
                        if (numbermsg.indexOf(MSGID) > -1) {
                            number = winParam.texts[l].number;
                            var timereceived = winParam.texts[l].time_received;
                            //converting Unix time format to normal time
                            var unix_timestamp = timereceived;
                            var date = new Date(unix_timestamp * 1000);
                            var hours = date.getHours();
                            var minutes = date.getMinutes();
                            var seconds = date.getSeconds();
                            var formattedTime = hours + ':' + minutes + ':' + seconds;
                        }
                    }

                    //alert("Timereceived1 :" + formattedTime);
                    // mobile number
                    //alert("Number:" + number);

                    //alert("incomplete content: " + smscontent);
                    //smscontent = smscontent.replace(/\s/g, "");

                    tx.executeSql('INSERT OR IGNORE INTO MessageContent (Recid,Smscontent,StatusDelivery,Mobileno) VALUES ("' + MSGID + '","' + smscontent + '","' + deliveyday + '","' + number + '")');


                }

            }


        }, function (error) { alert("error"); }, "SMSReader", "GetTexts", ["", -1]);
    });

    db.transaction(function (tx) {
        OnloadMsgData();

    });


}
function OnloadMsgData() {
    //alert('hi');
    var trow2 = "";
    trow2 = trow2 + "<tr style=\"font-size: 11px;\">";
    trow2 = trow2 + "<td style=\"font-size: 11px;width:65%;\" >";
    trow2 = trow2 + "<span style=\"margin-left: 15%;\">ORDER</span>";
    trow2 = trow2 + "</td>";
    trow2 = trow2 + "<td style=\"font-size: 11px;width:24%;\">";
    trow2 = trow2 + "<span style=\"\">DELIVERY DAY</span>";
    trow2 = trow2 + "</td>";
    trow2 = trow2 + "<td style=\"font-size: 11px;width:10%;\">";
    trow2 = trow2 + "<span style=\" \">EDIT</span>";
    trow2 = trow2 + "</td>";



    trow2 = trow2 + "</tr>";
    $('#headertbl').html(trow2);


    var trow = "";
    var htmlstr = "";
    var getOrderdbcon = window.openDatabase('Medord_R', '1.0', 'Medord_R', 2 * 1024 * 1024);
    getOrderdbcon.transaction(function getord(tx) {

        tx.executeSql('select * from MessageContent where status is null', [], function querySuccessorddet(txx, res) {
            //tx.executeSql('select * from MessageContent', [], function querySuccessorddet(txx, res) {
            for (var i = 0; i < res.rows.length; i++) {
                //alert('Row count' + res.rows.length);
                var ss = res.rows.item(i);
                //alert(ss.status);
                // alert(ss.Smscontent);
                var a = ss.Smscontent.split("|");

                //alert(ss.status);
                trow = trow + "<tr style=\"font-size: 12px;\">";
                trow = trow + "<td style=\"font-size: 12px;width:66%;margin-left: 3%;word-break: break-all;\" >";
                trow = trow + a[0];
                trow = trow + "</td>";
                trow = trow + "<td style=\"font-size: 12px;width:1%;\">";
                trow = trow + ss.StatusDelivery;
                trow = trow + "</td>";
                trow = trow + "<td style=\"font-size: 12px;width:10%;\">";
                trow = trow + "</td><td align='center'><img src='JS/images/edit.png' width='35px' height='35px'  value='click' onclick=\'fnCallQuizEdit(" + ss.id + ")\'>";
                trow = trow + "</td>";

                trow = trow + "</tr>";

                //$('#MsgTable').html(trow);

            }
            $('#MsgTable').html(trow);
        });
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////////

$(function () {
    getOrder();
});
var length = 0;


function closeapp() {

    if (confirm('Are you sure want to quit the application?')) {

        navigator.app.exitApp();

    }
    else {

        return false;
    }
}
function fnCallQuizEdit(id) {
    var hidval = "<input type=\"hidden\" id=\"hidid\" value=" + id + ">";
    $("#hiddenval").html(hidval);
    var db = openDatabase('Medord_R', '1.0', 'Medord_R', 2 * 1024 * 1024);
    db.transaction(function getord(tx) {
        tx.executeSql("select * from MessageContent where id='" + id + "'", [], function querySuccessorddet(tx, res) {
            for (var i = 0; i < res.rows.length; i++) {

                var ss = res.rows.item(i);

                var lblmsg = ss.Smscontent;

                var names;
                var address;
                var delivery;
                var Age;
                var arr1 = new Array();
                arr1 = lblmsg.split(":");



                //alert("Msg:" + arr);
                var arrname1 = new Array();
                arrname1 = arr1[0].split('(');
                names = arrname1[0];

                var arrage1 = new Array();
                arrage1 = arrname1[1].split(')');
                Age = arrage1[0];

                var time1 = new Array();
                time1 = arr1[3].split('Delivery');
                deliverytime = time1[0];

                var deliverydate = new Array();
                deliverydate = arr1[2].split('Time');
                delivery = deliverydate[0];
                //                //alert("delivery:" + delivery);

                var addr = new Array();
                addr = arr1[4].split('|');
                address = addr[0];


                $('#name').html(names);
                $('#Age').html(Age);
                $('#time').html(deliverytime);
                $('#delivery').html(delivery);
                $('#addr').html(address);



                var txt = ss.Smscontent;

                var arr = new Array();
                var name;
                arr = txt.split(":");
                var arrname = new Array();
                arrname = arr[0].split('(');
                name = arrname[0];

                //alert(arr[4]);
                //alert(JSON.stringify(arr1[5]));
                var medarray = new Array();
                medarray = arr1[5].split(',');
                //                medarray = arr[4].split(',');
                //alert(medarray);
                length = medarray.length;
                var output = "<table  style='border: 1px solid black;border-spacing:0px;width:100%;table-layout: fixed;'><tr style='background-color: Gray;border: 1px solid black;color:white;'><td  style='border: 1px solid black;width:25%;word-wrap: break-word;text-align:center;'>Medicine</td><td style='border: 1px solid black;width:25%;text-align:center'>Qty</td><td  style='text-align:center;border: 1px solid black;width:26%;'>Availability</td><td style='border: 1px solid black;width:24%;text-align:center'>Amount</td></tr>";
                for (i = 0; i < medarray.length; i++) {

                    var meditem = new Array();
                    meditem = medarray[i].split('-');
                    output = output + "<tr >";
                    output = output + "<td   style='border: 1px solid black;width:25%;text-align:center;word-wrap: break-word;'>";
                    output = output + meditem[0].replace(/\s/g, "");
                    output = output + "</td>";
                    output = output + "<td  style='border: 1px solid black;width:25%;text-align:center;word-wrap: break-word;'>";
                    output = output + meditem[1];
                    output = output + "</td>";
                    output = output + "<td  style='border: 1px solid black;text-align:center;word-wrap: break-word;'>";
                    output = output + "<span><input id=text" + i + " type='text' data-mini='true' value='" + meditem[1] + "' data-clear-btn='true' style='width:75%'/></span>";
                    output = output + "</td>";
                    output = output + "<td  style='border: 1px solid black;text-align:center;word-wrap: break-word;'>";
                    output = output + "<span><input id=txt" + i + "  onblur='hidecross(this)'   type='number' data-mini='true' data-clear-btn='true' style='width:75%'/></span>";
                    output = output + "</td>";

                    output = output + "</tr>";
                }
                output = output + "</table>";
                $('#meddetails').html(output);


            }
        });
    });
    $.mobile.changePage($("#SingleMessageContent"));
}



function hidecross(val) {
    var total = 0;
    for (var i = 0; i < length; i++) {
        if ($("#txt" + i).val() != "") {
            if (!isNaN($("#txt" + i).val())) {
                total = total + parseInt($("#txt" + i).val());
            }
        }
    }
    document.getElementById("Txttotal").value = total;

    return false;

}

function sendreply() {

    var Toamt = document.getElementById('Txttotal').value;
    if (Toamt != "") {
        var id = document.getElementById('hidid').value;
        var total = document.getElementById('Txttotal').value;
        //alert(id);
        var db = openDatabase('Medord_R', '1.0', 'Medord_R', 2 * 1024 * 1024);
        db.transaction(function sentord(tx) {
            tx.executeSql("select * from MessageContent where id='" + id + "'", [], function querySuccessorddet(tx, res) {
                for (var i = 0; i < res.rows.length; i++) {
                    var ss = res.rows.item(i);
                    var Recid = ss.Recid;
                    //alert(Recid);

                    var lblmsg = ss.Smscontent;
                    var name = new Array();
                    name = lblmsg.split("(");
                    //alert(name[0]);
                    //alert("Smscontent:" + lblmsg);
                    var mobileno = ss.Mobileno;
                    var arr9 = new Array();

                    arr9 = lblmsg.split("|");
                    var arr = new Array();
                    arr = arr9[1].split(":");
                    //alert(arr[0]);
                    //alert(arr[1]);

                    var medarray = new Array();
                    medarray = arr[1].split(',');
                    //alert(arr[4]);
                    //alert(arr[4]);
                    length = medarray.length;
                    var msg = "The Following Ordered Medicines Are Available:";
                    var output = "";
                    for (i = 0; i < medarray.length; i++) {
                        var availmed = document.getElementById('text' + i).value;
                        if (availmed == 0) {
                            var availmedi = "N/A";
                        } else {
                            var availmedi = availmed;
                        }
                        //alert(availmed);
                        var meditem = new Array();
                        meditem = medarray[i].split('-');
                        //var msg1 = "\nMedicines:\n";
                        var msg3 = "\nTotalAmount:Rs." + total + "\n";

                        var msg2 = medarray[i] + "(" + availmedi + ")" + ",";
                        output = output + msg2;
                        var fullmsg = "MD " + Recid + ":";
                        var fullmsg1 = "\n" + "Hi " + name[0] + "," + msg3 + msg + output;

                    }
                    //alert("fullmsg:" + fullmsg);
                    //alert("fullmsg1:" + fullmsg1);
                    //alert("mobileno:" + mobileno);
                    sendordermsg(fullmsg, fullmsg1, mobileno, fullmsg1, Recid);

                }
            });
        });

    } else {
        alert('Please Enter Total amount');
        document.getElementById('Txttotal').focus;
    }
}

/*SENDSMS:Function for SMS Sending using Codova-Android SMS Manager Plugin*/

function sendordermsg(fMessage, fMessage1, mobile, ordercontent, mid) {
    //alert("Customer no:"+mobile);
    var totallengthofmsg = fMessage.length + fMessage1.length;
    var currentsplitvalue = 140 - fMessage.length;

    var noofsplitsrequired = Math.round(totallengthofmsg / currentsplitvalue);

    var completemsg = fMessage + fMessage1;
    var currentstr = 0;
    var destinationstr = 0;
    //alert(completemsg);
    var message = "";

    for (var i = 0; i <= noofsplitsrequired; i++) {

        currentstr = destinationstr;
        destinationstr = destinationstr + currentsplitvalue;

        message = fMessage1.toString().substring(currentstr, destinationstr);
        //alert("message:" + message);
        var futurecurrentstr = destinationstr;
        //alert("futurecurrentstr:" + futurecurrentstr);
        var futuredestinationstr = destinationstr + currentsplitvalue;
        //alert("futurecurrentstr:" + futurecurrentstr);
        if (fMessage1.toString().substring(futurecurrentstr, futuredestinationstr) != "") {

            message = message + " More";
            //alert("message:" + message);

        }

        try {
            //alert('hi');
            var smsSendingPlugin = cordova.require('cordova/plugin/smssendingplugin');
            //alert('hi....');
            if (message.length != 0) {
                //alert(fMessage + message + " {" + (i + 1) + "}");
                smsSendingPlugin.send(mobile, fMessage + message + " {" + (i + 1) + "}", function () {

                    $.mobile.changePage($("#MessageContent"));


                }, function () {
                    alert("Message not sent");
                });
            }

        }
        catch (e) {

        }



    }

    alert("Message sent");
    saveOrder(ordercontent, mid);

}

function saveOrder(con, id) {
    var tdate = new Date();
    var thours = tdate.getHours();
    var tminutes = tdate.getMinutes();
    var s_id = document.getElementById('hidid').value;

    var s = "sent";

    var tformattedTime = thours + ':' + tminutes;
    //alert(tformattedTime);
    var dbinsertorddet = window.openDatabase("Medord_R", "1.0", "Medord_R", 2 * 1024 * 1024);
    var qryorddet = 'INSERT INTO OrderDetails (msgid,orddetails,time) VALUES ("' + id + '","' + con + '","' + tformattedTime + '")';
    dbinsertorddet.transaction(function insertorddetailsDB(tx) {
        tx.executeSql(qryorddet);
        tx.executeSql('update MessageContent set status ="' + s + '" where id="' + s_id + '"');
    });
    getOrder();
    OnloadMsgData();

}

function getOrder() {

    var output = "";
    var getOrderdbcon = window.openDatabase("Medord_R", "1.0", "Medord_R", 2 * 1024 * 1024);
    getOrderdbcon.transaction(function getord(tx) {
        tx.executeSql('select * from OrderDetails a inner join MessageContent b on a.msgid=b.Recid', [], function querySuccessorddet(txx, res) {

            for (var i = 0; i < res.rows.length; i++) {

                var ss = res.rows.item(i);
                output = output + "<div class='messagebody' style='background-color:#E6EBE6; word-break: break-all;'>";
                output = output + "<b>Received:</b><br>";
                output = output + ss.Smscontent;
                output = output + "</div>";
                output = output + "<div class='messagebody' style=' background-color:#CFD4CF; word-break: break-all;'>";
                output = output + "<b>Sent:</b><br>";
                output = output + ss.orddetails;
                output = output + "</div>";
                output = output + "<hr class='hr'/>";
                $("#orderhistorylist").html(output);



            }
        });
    });
}

