
import React, { Component }  from 'react';
import { Alert, ScrollView, StyleSheet, View, Text, TextInput, Picker,StatusBar, TouchableHighlight,TouchableOpacity, ImageBackground, Image,AsyncStorage,Keyboard,Linking,PermissionsAndroid,ToastAndroid,Dimensions,ActivityIndicator} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Constants from 'expo-constants';
import { FontAwesome ,AntDesign} from '@expo/vector-icons';
import * as Expo from 'expo';
import * as Permissions from 'expo-permissions';
import * as Svg from 'react-native-svg';
import Toast, {DURATION} from 'react-native-easy-toast';
import PropTypes from 'prop-types';
import SearchableDropdown from 'react-native-searchable-dropdown';
import CountryCodeList from './CountryList.json';
import CountryCodes from './country-by-calling-code.json';
import CountryFlags from './country-by-flag.json';
import base64 from 'react-native-base64'


const { width,height } = Dimensions.get('window');
const { Circle, Rect , SvgXml } = Svg;



class LoginScreen extends Component {

    constructor(props) {
      super(props);
      this.state = {
          needOTP : false,
          username:'',
          sessionid:'',
          name:'',
          token:'',
          loginname:'',
          password:'',
          url:props.url,
          loader:false,
          mobileNo:'',
          color:props.color,
          countryCodeList:[],
          selectedCode:null,
          inputText:'',
          countryCodeArr:CountryCodes,
          countryFlagArr:CountryFlags,
          selectedCountry:CountryCodes[0],
          selectedFlag:CountryFlags[0],
          selectCountry:false

      }
      Keyboard.addListener('keyboardDidHide',this.showKeyboard)
      Keyboard.addListener('keyboardDidShow', this.hideKeyboard)
    }

    showKeyboard =()=>{
      this.setState({keyboardOpen : false})
      this.setState({scrollHeight:this.state.scrollHeight+500})
      setTimeout(()=> {
        if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
          return
        }
        this.refs._scrollView.scrollToEnd({animated: true});
      }, 500);
    }

    hideKeyboard =(e)=>{
      this.setState({keyboardOpen : true})
      this.setState({keyboardHeight:e.endCoordinates.height+30});
      try {
        this.setState({scrollHeight:this.state.scrollHeight-500})
      } catch (e) {} finally {}
      setTimeout(()=> {
        if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
          return
        }
        this.refs._scrollView.scrollToEnd({animated: true});
        }, 500);
    }

    componentDidMount(){
      this.setCountryCode()
      // this.setState({selectedCountry:this.state.countryCodeArr[0],selectedFlag:this.state.countryFlagArr[0]})
      console.log(`data:image\/svg+xml;base64,${base64.decode(this.state.selectedFlag.flag_base64.split(',')[1])}`,'jjjjj')
    }

    setCountryCode=()=>{
      var arr = []
      this.state.countryCodeArr.forEach((item, i) => {
        var name = item.calling_code!=null?item.calling_code.toString():''
        arr.push({id:i,name:name,country:item.country})
      });
      this.setState({countryCodeList:arr})
    }

    selectCountryCode=(item)=>{
      this.setState({ selectedCode: item,inputText:item.name, });
      var index = null
      this.state.countryFlagArr.forEach((j, i) => {
        if(j.country==item.country){
          index = i
        }
      });
      if(index!=null){
        this.setState({selectedFlag:this.state.countryFlagArr[index],selectCountry:true,})
      }else{
        this.setState({selectCountry:false,})
      }

    }

    getOtp() {
       if(this.state.mobileNo == undefined){
         this.refs.toast.show('Mobile no was incorrect ');
       }
       else{
         var data = new FormData();
         data.append( "mobile", this.state.mobileNo );
         fetch( this.state.url + '/api/homepage/registration/', {
           method: 'POST',
           body: data
         }).then((response)=>{
           if(response.status == 200 || response.status==201 ){
             var d = response.json()
             return d
           }else{
             this.refs.toast.show('Mobile No Already register with user ');
           }
         })
         .then((responseJson) => {
            // this.setState({ userPk: responseJson.pk,token:responseJson.token,mobile:responseJson.mobile,username:this.state.mobile });
            // AsyncStorage.setItem("userpk", responseJson.pk + '')
          })
         .catch((error) => {
           return
         });
       }
   }

  sendOtp(){
    // this.props.navigation.navigate('OtpScreen',{
    //   screen:'LogInScreen',
    //   url:this.state.url,
    //   username:this.state.mobileNo,
    // })
    // return
    // var mob = /^[1-9]{1}[0-9]{9}$/;
    // if (this.state.mobileNo == undefined || mob.test(this.state.mobileNo) == false) {
    //   this.refs.toast.show('Enter Correct Mobile No');
    // }

    if(this.state.selectedCode==null){
      this.refs.toast.show('Select Country Code');
      return
    }
    if (this.state.mobileNo == undefined || this.state.mobileNo.length==0) {
      this.refs.toast.show('Enter Username or Mobile No');
    }else {
      // this.refs.toast.show('OTP request sent.');
      var data = new FormData();
      console.log(this.state.url + '/generateOTP/?mobile='+this.state.mobileNo+'&countryCode='+this.state.selectedCode.name,'vivkyc');
      data.append("id", this.state.mobileNo);
      fetch(this.state.url + '/generateOTP/?mobile='+this.state.mobileNo+'&countryCode='+this.state.selectedCode.name, {
        method: 'GET',
      })
        .then((response) => {
          if (response.status == 200) {
            this.setState({ username: this.state.mobileNo })
            try{
              var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
            }catch(e){
              var sessionid = null
            }
            console.log(response.headers,sessionid,'fdkgmjdm');
            if(sessionid!=null){
              this.setState({ sessionid: sessionid })
              AsyncStorage.setItem("sessionid", sessionid)
              return response.json()
            }else{
              return true
            }
          }else{
            return false
          }
        })
        .then((responseJson) => {
          console.log(responseJson,'fskfgjkdmfg');
          if(responseJson.pk!=undefined){
            var csrf = responseJson.csrf_token
            var url = this.state.url
            AsyncStorage.setItem("SERVER_URL", this.state.url)
            AsyncStorage.setItem("csrf", responseJson.csrf_token)
            AsyncStorage.setItem("userpk", JSON.stringify(responseJson.pk))
            console.log(responseJson,'kkkkkkkkkkkkkkkkkkkkkkkkkk ');
            AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
             return  this.props.navigation.navigate ('DefaultScreen')
            });
          }else{
            if (!responseJson){
              this.getOtp()
            }else{
              this.props.navigation.navigate('OtpScreen',{
                screen:'LogInScreen',
                url:this.state.url,
                username:this.state.mobileNo,
                countryCode:this.state.selectedCode
              })
              // this.props.sendOtp(true)
              return
            }
          }


        })
        .catch((error) => {
          this.refs.toast.show(error.toString());
          // this.props.sendOtp(false)
          return
        });
    }
}


    logIn(){
      console.log(this.state.url);
        this.setState({loader:true})
        var serverURL = this.state.url;
        if(this.state.needOTP == false){
          var data = new FormData();
           data.append( "username", this.state.username );
           data.append( "password", this.state.otp );
           fetch(this.state.url + '/login/?mode=api', {
             method: 'POST',
             body: data,
             headers : {
             }
           })
           .then((response) =>{
           if (response.status == 200){
             var sessionid = response.headers.get('set-cookie').split(';')[0].split('=')[1]
             this.setState({sessionid:sessionid})
             AsyncStorage.setItem("sessionid", JSON.stringify(sessionid))
             return response.json()
           }else{
             ToastAndroid.show('Incorrect Username or Password', ToastAndroid.SHORT);
             return
           }})
           .then((responseJson) => {
             var csrf = responseJson.csrf_token
             var url = this.state.url
             AsyncStorage.setItem("SERVER_URL", this.state.url)
             AsyncStorage.setItem("csrf", responseJson.csrf_token)
             fetch(this.state.url + '/api/HR/users/?mode=mySelf&format=json', {
               headers: {
                  "Cookie" :"csrftoken="+responseJson.csrf_token+";sessionid=" + this.state.sessionid +";",
                 'Accept': 'application/json',
                 'Content-Type': 'application/json',
                 'Referer': this.state.url,
                 'X-CSRFToken': responseJson.csrf_token
               },
               method: 'GET'
                })
               .then((response) =>{
                 if (response.status !== 200) {
                  return;
                }
                else if(response.status == 200){
                 return response.json()
                }
              })
           .then((responseJson) => {
             console.log(responseJson,'mode sucesss');
             responseJson[0].csrf = csrf
             responseJson[0].serverUrl  = url
             this.props.setUserDetails(responseJson[0])
             AsyncStorage.setItem("userpk", JSON.stringify(responseJson[0].pk))
             AsyncStorage.setItem("is_staff", JSON.stringify(responseJson[0].is_staff))
             AsyncStorage.setItem("userpic",JSON.stringify(responseJson[0].profile))
             AsyncStorage.setItem('mobile',JSON.stringify(responseJson[0].profile.mobile));
             AsyncStorage.setItem("first_name",JSON.stringify(responseJson[0].first_name))
             AsyncStorage.setItem("last_name",JSON.stringify(responseJson[0].last_name))
             AsyncStorage.setItem("SERVER_URL", this.state.url)
             this.setState({loader:false})
            //  AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
            //    if(responseJson[0].is_staff){
            //      this.props.navigation.navigate('ScannerScreen')
            //    }else{
            //      this.props.navigation.navigate('NavigationScreen')
            //    }
            // });
           })
         })
         .catch((error) => {
           this.setState({loader:false})
           ToastAndroid.show('Incorrect Username or Password', ToastAndroid.SHORT);
         });
       }else{
         var data = new FormData();
         data.append( "username", this.state.username );
         data.append( "otp", this.state.otp );
         fetch(this.state.url + '/login/?otpMode=True&mode=api', {
           method: 'POST',
           body: data,
           headers : {
           }
         })
         .then((response) =>{
           console.log(response.status, 'otpmode login');
           if (response.status == 200){
             var sessionid = response.headers.get('set-cookie').split(';')[0].split('=')[1]

             this.setState({sessionid:sessionid})
             AsyncStorage.setItem("sessionid", sessionid)
             return response.json()
           }
           else{
             ToastAndroid.show('Mobile no was incorrect...', ToastAndroid.SHORT);
           }})
           .then((responseJson) => {
             // console.log(responseJson.csrf_token,'kkkkkkkkkkkkkkkkkkkkkkkkkk');
             AsyncStorage.setItem("csrf", responseJson.csrf_token)
             AsyncStorage.setItem("SERVER_URL", this.state.url)
             console.log(AsyncStorage.setItem("SERVER_URL", this.state.url),'url');
             fetch(this.state.url + '/api/HR/users/?mode=mySelf&format=json', {
               headers: {
                  "Cookie" :"csrftoken="+responseJson.csrf_token+";sessionid=" + this.state.sessionid +";",
                 'Accept': 'application/json',
                 'Content-Type': 'application/json',
                 'Referer': this.state.url,
                 'X-CSRFToken': responseJson.csrf_token
               },
               method: 'GET'
              })
             .then((response) =>{
               if (response.status !== 200) {
                   ToastAndroid.show(' no was incorrect...', ToastAndroid.SHORT);
                 }
                 else if(response.status == 200){
                   return response.json()
                 }
               })
               .then((responseJson) => {
                 console.log(responseJson,'mode sucesss');
                 this.setState({needOTP:false})
                 AsyncStorage.setItem("userpk", JSON.stringify(responseJson[0].pk))
                 AsyncStorage.setItem("SERVER_URL", this.state.url)
                 console.log(this.state.url,'urllllllll');
                 AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {

                 });
           })
         })
         .catch((error) => {
           ToastAndroid.show('Incorrect OTP', ToastAndroid.SHORT);
         });
       }
   }


  renderSvg=()=>{
    return(
      <View style={{backgroundColor:'transparent',position:'absolute',top:0,left:0,right:0,zIndex:1 }}>
        <Svg height={height*0.8} width={width} viewBox={`0 0 500 150`} preserveAspectRatio="none">
                <Path
                  d="M-7.34,133.52 C151.23,152.27 344.24,154.23 505.07,133.53 L500.00,0.00 L0.00,0.00 Z"
                  fill={'#f2f2f2'}
                  stroke={'#f2f2f2'}
                />
          </Svg>
      </View>
    )
  }



  render(){
     if(!this.state.loader){
     return (
        <View style={{flex:1,backgroundColor:'#f2f2f2',}}>
        <Toast style={{backgroundColor: '#000'}} textStyle={{color: '#fff'}} ref="toast" position = 'bottom'/>
          <View style={{height:Constants.statusBarHeight,backgroundColor:this.state.color}}>
             <StatusBar  translucent={true} barStyle="light-content" backgroundColor={this.state.color} networkActivityIndicatorVisible={false}  />
         </View>

           <View style={{flex:1,zIndex:2,}}>
               <View style={{flex:1}}>
                 <View style={{flex:0.2,zIndex:2,flexDirection:'row',alignItems:'center',marginHorizontal:30}}>
                    <Image style={{width:50,height:50,resizeMode:'contain'}} source={require('./Images/appiconred.png')} />
                    <Text style={{fontWeight: 'bold',fontSize: 25,color:'#000',marginLeft:10}}> KloudERP </Text>
                 </View>
                 <View style={{flex:0.8,zIndex:2,justifyContent:'flex-start'}}>

                   <View style={{marginVertical:15,marginHorizontal:30,marginTop:height*0.15}}>
                      <Text style={{fontWeight: 'bold',fontSize: 25,color:'#000'}}> Login </Text>
                   </View>

                     <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>

                    <SearchableDropdown
                      onItemSelect={(item) => {
                        this.selectCountryCode(item)

                      }}
                      onTextChange={(item) => {
                        this.setState({selectedCode:null });
                      }}
                      containerStyle={{  }}
                      itemStyle={{
                        padding: 10,
                        marginTop: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        borderRadius: 5,
                      }}
                      itemTextStyle={{ color: 'rgba(0, 0, 0, 0.5)' }}
                      itemsContainerStyle={{ }}
                      items={this.state.countryCodeList}
                      defaultIndex={0}
                      resetValue={false}
                      textInputProps={
                        {
                          placeholder: "Country Code",
                          underlineColorAndroid: "transparent",
                          placeholderTextColor:'rgba(0, 0, 0, 0.5)',
                          keyboardType:'numeric',
                          style: {
                              paddingHorizontal: 12,
                              height:50,
                              borderWidth: 1,
                              borderColor: 'rgba(0, 0, 0, 0.1)',
                              borderRadius: 10,
                              backgroundColor:'rgba(0, 0, 0, 0.1)',
                              fontSize:16,
                          },
                        }
                      }
                      listProps={
                        {
                          nestedScrollEnabled: true,
                        }
                      }
                  />
                    </View>

                   <View style={{marginHorizontal:30,width:width-60,marginVertical:15,flexDirection:'row'}}>
                  { this.state.selectCountry&&<TouchableOpacity style={{flex:0.2,alignItems:'center',justifyContent:'center',height: 50,borderRightWidth:1,width:'100%',borderTopLeftRadius:10,borderBottomLeftRadius:10,backgroundColor:'rgba(0, 0, 0, 0.1)',borderColor:'#f2f2f2',flexDirection:'row'}}>
                      {this.state.selectedFlag!=null&&this.state.selectedFlag.flag_base64!=null&&
                        <SvgXml height={20} width={35} xml={`data:image/svg+xml;base64,${base64.decode(this.state.selectedFlag.flag_base64.split(',')[1])}`} />
                      }
                    </TouchableOpacity>}
                    <View style={{flex:this.state.selectCountry?0.8:1}}>
                    <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderTopRightRadius:10,borderBottomRightRadius:10,borderTopLeftRadius:this.state.selectCountry?0:10,borderBottomLeftRadius:this.state.selectCountry?0:10,backgroundColor:'rgba(0, 0, 0, 0.1)',paddingHorizontal:15,fontSize:16}}
                        placeholder="Mobile Number"
                        placeholderTextColor='rgba(0, 0, 0, 0.5)'
                        selectionColor={'#000'}
                        onChangeText={query => { this.setState({ mobileNo: query });this.setState({ username: query }) }}
                        value={this.state.mobileNo}
                     />
                    </View>

                    </View>

                    <TouchableOpacity onPress={()=>{this.sendOtp()}} style={{alignItems:'center',justifyContent:'center',marginHorizontal:30,width:width-60,borderRadius:10,marginVertical:15,paddingVertical:12,backgroundColor:'#286090'}}>
                      <Text style={{fontSize:18,color:'#fff',fontWeight:'600'}}>Proceed</Text>
                    </TouchableOpacity>

                 </View>
               </View>
           </View>
        </View>
    );
  }else{
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="small" color={this.state.color} />
      </View>
    )
   }
  }
}

LoginScreen.propTypes = {
  url:PropTypes.string,
  color:PropTypes.string
};

LoginScreen.defaultProps = {
  url: 'https://klouderp.com',
  color:'#f2f2f2'
};


const styles = StyleSheet.create({

});


export {
  LoginScreen
}
  // url: 'https://klouderp.com',
