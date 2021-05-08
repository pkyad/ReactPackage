
import React, { Component }  from 'react';
import { Alert, ScrollView, StyleSheet, View, Text, TextInput, Picker,StatusBar, TouchableHighlight,TouchableOpacity, ImageBackground, Image,AsyncStorage,Keyboard,Linking,PermissionsAndroid,ToastAndroid,Dimensions,ActivityIndicator} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Constants from 'expo-constants';
import { FontAwesome } from '@expo/vector-icons';
import * as Expo from 'expo';
import * as Permissions from 'expo-permissions';
import Svg, { Circle, Rect,Path,Defs,G,Mask} from 'react-native-svg';
import Toast, {DURATION} from 'react-native-easy-toast';
import PropTypes from 'prop-types';
import * as  ImagePicker  from 'expo-image-picker';
import Modal from "react-native-modal";
import { HttpsClient } from 'react-setup-initial';


const { width,height } = Dimensions.get('window');


class RegisterScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
        loader:false,
        name:'',
        companyName:'',
        serverURL:null,
        mobile:'',
        email:'',
        logo:null,
        openImageModal:false
    }
  }

  componentDidMount() {
    this.setUrl()
  }

  setUrl=async()=>{
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    this.setState({SERVER_URL:SERVER_URL})
  }

saveDetails=async()=>{

   const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
   const sessionid = await AsyncStorage.getItem('sessionid');
   const csrf = await AsyncStorage.getItem('csrf');
   const pk = await AsyncStorage.getItem('userpk');

   if(this.state.companyName.length==0){
     this.refs.toast.show('Enter Company Name');
     return
   }
   if(this.state.name.length==0){
     this.refs.toast.show('Enter Name');
     return
   }
   if(this.state.mobile.length!=10){
     this.refs.toast.show('Enter Correct Mobile');
     return
   }
   if(this.state.email.length==0){
     this.refs.toast.show('Enter Email');
     return
   }
   if(this.state.logo==null){
     this.refs.toast.show('Select Logo');
     return
   }

     var dataSend ={
       pk:pk,
       name:this.state.name,
       mobile:this.state.mobile,
       email:this.state.email,
       logo:this.state.logo,
       company:this.state.companyName,
       bodyType:'formData'
     }
     var serverurl = SERVER_URL + '/api/HR/updateProfile/'
     var data = await HttpsClient.post(serverurl,dataSend)

     console.log(dataSend,'dfbsbn',data,serverurl);
     if(data.type=='success'){
       this.props.navigation.navigate ('DefaultScreen')
     }else{
       return
     }

     // fetch(SERVER_URL+'/api/HR/updateProfile/', {
     //   method: 'POST',
     //   headers: {
     //     "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
     //     'Content-Type': 'application/json',
     //     'X-CSRFToken':csrf,
     //     'Referer': SERVER_URL,
     //   },
     //   body:JSON.stringify(dataSend),
     // }).then((response) =>{
     //     if(response.status == '200'||response.status == '201'){
     //       return response.json();
     //     }
     // }).then((json) => {
     //    this.props.navigation.navigate ('Main')
     //    return
     //    console.log(json,'response added company address');
     // })
     // .catch((error) => {
     //    console.log(error)
     // });
  }

  attachShow=async()=>{
   const { status, expires, permissions } = await Permissions.getAsync(
   Permissions.CAMERA_ROLL,
   Permissions.CAMERA
 );

 if(permissions.camera.status == 'granted'){
   if(permissions.mediaLibrary.status == 'granted'){
     this.setState({openImageModal:true})
   }else{
     this.getCameraRollAsync()
   }
 }else{
   this.getCameraAsync()
 }
}

getCameraAsync=async()=> {

const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
if (status === 'granted') {
 this.attachShow()
} else {
 throw new Error('Camera permission not granted');
}
}

getCameraRollAsync=async()=> {

const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
if (status === 'granted') {
this.attachShow()
} else {
throw new Error('Gallery permission not granted');
}
}
handlePhoto = async () => {
   let picture = await ImagePicker.launchCameraAsync({
       mediaTypes:ImagePicker.MediaTypeOptions.Images,
       quality: 0.1,
     });
   if(picture.cancelled == true){
     return
   }

   let filename = picture.uri.split('/').pop();
   let match = /\.(\w+)$/.exec(filename);
   let type = match ? `image/${match[1]}` : `image`;

   const photo = {
     uri: picture.uri,
     type: type,
     name:filename,
   };
   this.setState({logo:photo})
}


_pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Images,
       allowsMultipleSelection: true
    });
    if(result.cancelled == true){
      return
    }

    let filename = result.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    var type = match ? `image/${match[1]}` : `image`;
    const photo = {
       uri: result.uri,
       type: type,
       name:filename,
    };
    this.setState({logo:photo,})
};

modalAttach =async (event) => {
  if(event == 'gallery') return this._pickImage();
  if(event == 'camera'){
      this.handlePhoto()
  }
};


  render(){

     if(!this.state.loader){
     return (
        <View style={{flex:1,backgroundColor:'#f2f2f2',}}>
        <Toast style={{backgroundColor: '#000'}} textStyle={{color: '#fff'}} ref="toast" position = 'bottom'/>

          <View style={{height:Constants.statusBarHeight,backgroundColor:'#f2f2f2'}}>
            <StatusBar  translucent={true} barStyle="light-content" backgroundColor={'#f2f2f2'} networkActivityIndicatorVisible={false}    />
          </View>

           <ScrollView >
               <View style={{flex:1}}>
                  <View style={{height:height*0.15,zIndex:2,flexDirection:'row',alignItems:'center',marginHorizontal:30}}>
                    <Image style={{width:50,height:50,resizeMode:'contain'}} source={require('./Images/appiconred.png')} />
                    <Text style={{fontWeight: 'bold',fontSize: 25,color:'#000',marginLeft:10}}> Kloud ERP </Text>
                 </View>
                  <View style={{height:height*0.15,zIndex:2,alignItems:'center',marginHorizontal:30}}>
                    <Text style={{fontWeight: '600',fontSize: 20,color:'grey',marginLeft:10,lineHeight:30}}>Hello there, need few more information to setup your account with us. </Text>
                 </View>

                 <View style={{minHeight:height*0.7,zIndex:2,justifyContent:'flex-start'}}>


                   <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}> Company Name *</Text>
                     <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.1)',paddingHorizontal:15,fontSize:16}}
                       placeholder="Company Name"
                       placeholderTextColor='rgba(0, 0, 0, 0.5)'
                       selectionColor={'#000'}
                       onChangeText={query => { this.setState({ companyName: query }) }}
                       value={this.state.companyName}
                     />
                   </View>

                    <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                      <Text style={{color:'#000',fontSize:16,paddingBottom:10}}> Name *</Text>
                      <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.1)',paddingHorizontal:15,fontSize:16}}
                         placeholder="Name"
                         placeholderTextColor='rgba(0, 0, 0, 0.5)'
                         selectionColor={'#000'}
                         onChangeText={query => { this.setState({ name: query }) }}
                         value ={this.state.name}
                      />
                    </View>

                    <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                      <Text style={{color:'#000',fontSize:16,paddingBottom:10}}> Mobile Number *</Text>
                      <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.1)',paddingHorizontal:15,fontSize:16}}
                         placeholder="Mobile Number"
                         placeholderTextColor='rgba(0, 0, 0, 0.5)'
                         selectionColor={'#000'}
                         onChangeText={query => { this.setState({ mobile: query }) }}
                         value ={this.state.mobile.toString()}
                         keyboardType={'numeric'}
                      />
                    </View>

                    <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                      <Text style={{color:'#000',fontSize:16,paddingBottom:10}}> Email *</Text>
                      <TextInput style={{height: 50,borderWidth:1,borderColor:'rgba(0, 0, 0, 0.1)',width:'100%',borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.1)',paddingHorizontal:15,fontSize:16}}
                         placeholder="Email"
                         placeholderTextColor='rgba(0, 0, 0, 0.5)'
                         selectionColor={'#000'}
                         onChangeText={query => { this.setState({ email: query }) }}
                         value ={this.state.email}
                      />
                    </View>

                    <View style={{marginHorizontal:30,width:width-60,marginVertical:15,}}>
                      <Text style={{color:'#000',fontSize:16,paddingBottom:10}}> Logo *</Text>
                      <TouchableOpacity onPress={()=>{this.attachShow()}} style={{width:width*0.2,height:width*0.2,borderRadius:width*0.1,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}}>
                      <Image source={{uri:this.state.logo!=null?this.state.logo.uri:null}} style={{width:width*0.2,height:width*0.2,borderRadius:width*0.1}} />
                    </TouchableOpacity>
                    </View>



                    <TouchableOpacity onPress={()=>{this.saveDetails()}} style={{alignItems:'center',justifyContent:'center',marginHorizontal:30,width:width-60,borderRadius:10,marginVertical:15,paddingVertical:12,backgroundColor:'#286090'}}>
                      <Text style={{fontSize:18,color:'#fff',fontWeight:'600'}}>Save and Next</Text>
                    </TouchableOpacity>


                </View>


               </View>
           </ScrollView>
           <Toast ref={(toast) => this.toast = toast} style={[styles.shadow,{backgroundColor:'#fff'}]}
             position='bottom'
             positionValue={100}
             fadeInDuration={750}
             fadeOutDuration={1000}
             opacity={1}
             textStyle={{color:'#000'}}/>
           {this.renderModal()}
        </View>
    );
  }else{
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="small" color={'#f2f2f2'} />
      </View>
    )
  }
}
renderModal=()=>{
return(
      <Modal
          isVisible={this.state.openImageModal}
          hasBackdrop={true}
          style={[styles.modalView1,{position:'absolute',bottom:-20,left:0,right:0}]}
          onBackdropPress={()=>{this.setState({openImageModal:false});}} useNativeDriver={true} onRequestClose={()=>{this.setState({openImageModal:false});}} >
          <View style={{flexDirection:'row',}}>
              <TouchableOpacity onPress={()=>{this.modalAttach('gallery')}} style={{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:20}}>
                <FontAwesome
                    name="folder"
                    size={width*0.16}
                    style={{marginRight:5,color:'#132E5B',
                            textAlign: 'center'}} />
                    <Text   style={{fontSize:16,color:'#132E5B',textAlign:'center'}}>Gallary</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{this.modalAttach('camera')}} style={{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:20}}>
                <FontAwesome
                    name="camera"
                    size={width*0.14}
                    style={{color:'#132E5B',textAlign: 'center',}}
                    />
                <Text   style={{fontSize:16,color:'#132E5B',textAlign:'center',}}>camera</Text>
              </TouchableOpacity>
         </View>
    </Modal>
)
}
}


const styles = StyleSheet.create({
  submit:{
      marginRight:40,
      marginLeft:40,
      marginTop:10,
      paddingTop:10,
      paddingBottom:10,
      borderRadius:50,
  },
  modalView1:{
   backgroundColor: '#fff',
   marginHorizontal: 0 ,
   width:width
 },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1
  },
  });

export {
  RegisterScreen
}
