/**
 * Created by XJB11 on 2016/4/26 0026.
 */
CHAT.CONTROLLERS
  .controller('MineCtrl',['$scope','CommonMethods','Storage','$state','socket','$ionicPopup','$timeout','Message',
    function($scope,CommonMethods,Storage,$state,socket,$ionicPopup,$timeout,Message){
     $scope.goSetNickname = function(){
       $state.go("tab.mine-changeName",{nickname:$scope.userInfo.nickname});
     };

      $scope.goAccount = function(){
        $state.go('tab.mine-account');
      };

      $scope.goAboutApp = function(){
        $state.go('tab.mine-about');
      };

      $scope.confirmPop = function(){
        $scope.confirmPopup = $ionicPopup.show({
          title: "性别",
          templateUrl: "templates/mine/confirmPopup.html",
          scope: $scope
        });
        $timeout(function(){
          $scope.confirmPopup.close();
        },2000);
      };

      $scope.confirm = function(choice){
        if(!choice){
          $scope.confirmPopup.close();
        }else{
          $scope.confirmPopup.close();
          $scope.logOut();
        }
      };

      $scope.logOut = function(){
        var userInfo = Storage.get("userInfo");
        var userId = userInfo.id;
        var allRecords = Storage.get("allRecords");
        var records = Storage.get("records");
        allRecords[userId] = records;
        Storage.set("allRecords",allRecords);
        Storage.remove("userInfo");
        Storage.remove("records");
        Storage.remove("friendInfo");
        socket.emit("logout",{userInfo:userInfo});
        $state.go("tab.mine-login");
      };

     socket.on("friendInfo:success",function(data){
          var friendInfo = data.friendInfo;
          Storage.set("friendInfo",friendInfo);
     });

      socket.on("getOfflineMsg:success",function(data){
           var rows = data.rows;
           var record = {};
           var i = 0,
               j = 0;
           for(i=0;i<rows.length;i++){
             record =  Message.getMessageById(rows[i].fromUser);
              if(record!=null){
                    record.messages.push(JSON.parse(rows[i].message));
                    record.lastMessage = JSON.parse(rows[i].message);
                    record.noReadMessages++;
                    record.showHints = true;
                    record.showMessage = true;
                    Message.updateMessage(record);
              }else{
                $scope.createMessage(rows[i].message,$scope.findFriendById(rows[i].fromUser));
              }
          }
      });

      $scope.findFriendById = function(id){
         var friendInfo = Storage.get("friendInfo");
        for(var i=0;i<friendInfo.length;i++){
          if(friendInfo[i].id == id){
            return friendInfo[i];
          }
        }
        return null;
      };

      $scope.createMessage = function(message,friend){
        var messageStruct = {
          "id": friend.id,
          "backname": friend.backname,
          "nickname": friend.nickname,
          "img": friend.img,
          "lastMessage": {},
          "noReadMessages": 0,
          "showHints": false,
          "isTop": 0,
          "showMessage":true,
          "messages": []
        };
        messageStruct.messages.push(JSON.parse(message));
        messageStruct.lastMessage = JSON.parse(message);
        messageStruct.noReadMessages++;
        messageStruct.showHints = true;
        Message.updateMessage(messageStruct);
      };


      $scope.$on("$ionicView.beforeEnter",function(){
        $scope.userInfo = Storage.get("userInfo");
        $scope.userInfo.img = "img/head/"+$scope.userInfo.img+".png";
        socket.emit("friendInfo",{userId:$scope.userInfo.id});
        socket.emit("getOfflineMsg",{userId:$scope.userInfo.id});
      });
  }])
  .controller('AccountCtrl',['$scope','CommonMethods','Storage','$state','$ionicPopup','$timeout','$ionicHistory','socket',
    function($scope,CommonMethods,Storage,$state,$ionicPopup,$timeout,$ionicHistory,socket){
          $scope.$on('$ionicView.beforeEnter',function(){
            var userInfo = Storage.get("userInfo");
              $scope.account = userInfo;
              $scope.account.img = "img/head/" + userInfo.img + ".png";
          });

         $scope.changeImg = function(){
            var userInfo = Storage.get("userInfo");
            userInfo.img = (userInfo.img+10)%28;
            if(!userInfo.img){
              userInfo.img = 1;
            }
            $scope.account.img = "img/head/"+userInfo.img + ".png";
            Storage.set("userInfo",userInfo);
            socket.emit("changeImg",{userInfo:userInfo});
          };

          $scope.changeName = function(){
              $state.go('tab.mine-changeName',{"nickname":$scope.account.nickname});
          };
          $scope.changeDesc = function(){
              $state.go('tab.mine-changeDesc',{"description":$scope.account.description});
          };

          $scope.selectSex = function(){
            //这里通过$ionicPopup.show()方法创建了一个自定义的popup
            $scope.sexPopup = $ionicPopup.show({
              title: "性别",
              templateUrl: "templates/mine/sexPopup.html",
              scope: $scope
            });
            $timeout(function(){
              $scope.sexPopup.close();
            },3000);
          };
          $scope.setSex = function(sex){
            var userInfo = Storage.get("userInfo");
            userInfo.sex = sex;
            $scope.account.sex = sex;
            Storage.set("userInfo",userInfo);
            socket.emit("changeSex",{userInfo:userInfo});
            $scope.sexPopup.close();
          };

          $scope.changeLocation = function(){
            $state.go('tab.mine-changeLocation',{"location":$scope.account.location});
          };

      $scope.goBack =function(){
        $ionicHistory.goBack();
      };
      $scope.changeImgPop = function(){
        $scope.changeImgPopup = $ionicPopup.show({
          title: "性别",
          templateUrl: "templates/mine/changeImgPopup.html",
          scope: $scope
        });
        $timeout(function(){
          $scope.changeImgPopup.close();
        },3000);
      };

      $scope.confirm = function(choice){
        if(!choice){
          $scope.changeImgPopup.close();
        }else{
          $scope.changeImgPopup.close();
          $scope.changeImg();
        }
      };

      $scope.goModifyPassword = function(){
        $state.go('tab.mine-modifyPassword');
      }
    }])

  .controller('AboutCtrl',['$scope','$http','$ionicPopup','$timeout','$ionicHistory',
    function($scope,$http,$ionicPopup,$timeout,$ionicHistory){
           $scope.$on("$ionicView.beforeEnter",function(){
             $http.get("../../../data/json/conformation.json").success(function(data){
               $scope.appName = data.appName;
               $scope.appVersion = data.appVersion;
               $scope.appPlatform = data.appPlatform;
               $scope.author = data.author;
               $scope.contact = data.contact;
             })
           });

      $scope.showContact = function(){
        var contactPopup = $ionicPopup.alert({
           title: "联系方式",
           template: "<ion-list><ion-item>QQ:<span style='text-align: right;padding-left: 70px;'>"
                     + $scope.contact.QQ
                     + "</span></ion-item><ion-item>Tel:<span style='text-align: right;padding-left: 70px;'>"
                     + $scope.contact.Tel
                     + "</span></ion-item></ion-list>",
          okText: "naive!"
        });
        $timeout(function(){
          contactPopup.close();
        },500);
      };

      $scope.goBack =function(){
        $ionicHistory.goBack();
      };
  }]);
