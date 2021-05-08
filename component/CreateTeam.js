import React, { Component }  from 'react';
import {
  Image,Platform,ScrollView,StyleSheet,
  Text,TouchableOpacity,View,Slider,
  Dimensions, Alert, FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,StatusBar,Vibration,TouchableWithoutFeedback,TextInput,ViewPropTypes,Switch
} from 'react-native';
import { FontAwesome,FontAwesome5,MaterialCommunityIcons,Feather,MaterialIcons,Octicons ,AntDesign ,Entypo} from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card ,CheckBox } from 'react-native-elements';
import  ModalBox from 'react-native-modalbox';
import Modal from "react-native-modal";
import {SearchBar}from 'react-native-elements';
import moment from 'moment';
import MapView from 'react-native-maps';

import * as  ImagePicker  from 'expo-image-picker';
import { StackNavigator } from 'react-navigation';
import GradientButton from "react-native-gradient-buttons";
import * as Expo from 'expo';
import * as Permissions from 'expo-permissions';
import Svg, { Circle, Rect,Path,Defs,G,Mask} from 'react-native-svg';
import Toast, {DURATION} from 'react-native-easy-toast';
const { width,height } = Dimensions.get('window');
import  { HttpsClient }  from './HttpsClient.js';
import settings from './Constants.js';
import DropDownPicker from 'react-native-dropdown-picker';
const url = settings.url

class CreateTeam extends React.Component{

  static navigationOptions=({navigation})=>{
    const { params = {} } = navigation.state
    return {header:null}
  };


    constructor(props) {
      super(props);
      var item = props.navigation.getParam('item',null)
      var teamName=''
      var teamLead=null
      var teamUnit=null
      var isSupport=false
      var teamLeadName=''

      if(item!=null){
        teamName=item.title
        teamLead=item.manager
        teamUnit=item.unit
        isSupport=item.isOnSupport
        teamLeadName = item.manager!=null?item.manager.first_name+' '+item.manager.last_name:''
      }
      this.state = {
         SERVER_URL:'',
         teamName:teamName,
         teamLead:teamLead,
         teamUnit:teamUnit,
         isSupport:isSupport,
         editItem:item,
         teamList:[],
         show:false,
         teamLeadName:teamLeadName,
         unitList:[]
      };
      willFocus = props.navigation.addListener(
     'didFocus',
       payload => {

         }
      );
  }

    setUrl=async()=>{
      var SERVER_URL =  await AsyncStorage.getItem('SERVER_URL');
      this.setState({SERVER_URL})
    }

    componentDidMount=()=>{
      this.setUrl()
      this.getUnit()
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
     this.setState({openImageModal:false})
     if(this.state.selectedImage=='image1'){
       this.setState({img1:photo})
     }else if(this.state.selectedImage=='image2'){
       this.setState({img2:photo})
     }else{
       this.setState({img3:photo})
     }


}

removeAttachment=(type)=>{
  if(type=='image1'){
    this.setState({img1:null})
  }else if(type=='image2'){
    this.setState({img2:null})
  }else{
    this.setState({img3:null})
  }
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

      this.setState({openImageModal:false})
      if(this.state.selectedImage=='image1'){
        console.log(photo,'1');
        this.setState({img1:photo})
      }else if(this.state.selectedImage=='image2'){
        console.log(photo,'2');
        this.setState({img2:photo})
      }else{
        console.log(photo,'3');
        this.setState({img3:photo})
      }
};


    renderHeader=()=>{
      return(
        <View style={{flexDirection: 'row',height:55,alignItems: 'center',}}>
           <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{justifyContent: 'center', alignItems: 'center',width:width*0.15,}}>
            <MaterialIcons name={'keyboard-backspace'}size={30} color={'#252525'} />
           </TouchableOpacity>
           <View style={{width:width*0.7,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#252525',fontSize:20,fontWeight:'700'}}>{this.state.editItem!=null?'Edit':'Create'} Team</Text>
           </View>
          <View style={{width:width*0.15}} />
       </View>
      )
    }

    save=async()=>{

      if(this.state.teamName.length==0){
        this.toast.show('Enter Team Name',2000);
        return
      }
      if(this.state.teamLead==null){
        this.toast.show('Select Team Lead',2000);
        return
      }
      if(this.state.selectedUnitList==null){
        this.toast.show('Select Team Unit',2000);
        return
      }

      var sendData = {
        isOnSupport:this.state.isSupport,
        manager:this.state.teamLead.pk,
        title:this.state.teamName,
        unit:this.state.selectedUnitList.value,
      }


      if(this.state.editItem!=null){
        var serverurl =url + '/api/HR/team/'+this.state.editItem.pk+'/'
        var data = await HttpsClient.patch(serverurl,sendData)
      }else{
        var serverurl =url + '/api/HR/team/'
        var data = await HttpsClient.post(serverurl,sendData)
      }
      // return



      console.log(sendData,'dfbsbn',data,serverurl);
      if(data.type=='success'){
        this.props.navigation.goBack()
      }else{
        return
      }

    }



    getUnit=async()=>{

      var serverurl =url + '/api/organization/unit/'
      var data = await HttpsClient.get(serverurl)

      console.log('dfbsbn',data,serverurl);
      if(data.type=='success'){
        var arr = []
        data.data.forEach((item, i) => {
          var obj = {label:item.name,value:item.pk}
          arr.push(obj)
        });
        this.setState({unitList:arr})
        if(arr.length>0){
          this.setState({selectedUnitList:arr[0]})
        }
      }else{
        return
      }
    }

    setTeamList=(item)=>{
      this.setState({teamLead:item,teamLeadName:item.first_name+' '+item.last_name,show:false,teamList:[]})
    }

    modalAttach =async (event) => {
      if(event == 'gallery') return this._pickImage();
      if(event == 'camera'){
          this.handlePhoto()
      }
    };

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
                        style={{marginRight:5,color:'#373737',
                                textAlign: 'center'}} />
                        <Text   style={{fontSize:16,color:'#373737',textAlign:'center'}}>Gallary</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{this.modalAttach('camera')}} style={{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:20}}>
                    <FontAwesome
                        name="camera"
                        size={width*0.14}
                        style={{color:'#373737',textAlign: 'center',}}
                        />
                    <Text   style={{fontSize:16,color:'#373737',textAlign:'center',}}>camera</Text>
                  </TouchableOpacity>
             </View>
        </Modal>
  )
}

    getTeamLead=async(query)=>{
      this.setState({ teamLeadName: query });
        var serverurl = url + '/api/HR/userSearch/?username__contains='+query
        var data = await HttpsClient.get(serverurl)
        console.log(data);
        if(data.type=='success'){
          if(data.data.length>0){
            this.setState({teamList:data.data,show:true})
          }else{
            this.setState({show:false,teamList:[]})
          }
        }else{
          return
        }
    }

    render(){
        return(
          <View style={{flex:1,backgroundColor:"#fff"}}>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#fff'}}>
               <StatusBar   translucent={true} barStyle="dark-content" backgroundColor={'#fff'} networkActivityIndicatorVisible={false}    />
            </View>
            {this.renderHeader()}

            <View style={{flex:1,}}>
               <ScrollView  ref={(view) => {
                  this.scrollView = view;
                }} contentContainerStyle={{paddingBottom:60}}>

                 <View style={{marginTop:30,marginHorizontal:25,marginVertical:10,}}>
                  <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Team Name</Text>
                  <View style={{flexDirection:'row',}}>
                       <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Team Name"
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           selectionColor={'#000'}
                           onChangeText={query => { this.setState({ teamName: query }); }}
                           value={this.state.teamName}
                        />
                  </View>
                </View>



                  <View style={{marginHorizontal:25,marginVertical:10}}>
                    <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Team Lead</Text>
                    <View style={{flexDirection:'row',}}>
                         <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                           placeholder="Team Lead"
                           selectionColor={'#000'}
                           placeholderTextColor='rgba(0, 0, 0, 0.5)'
                           onChangeText={query => { this.getTeamLead(query)  }}
                           value={this.state.teamLeadName.toString()}
                          />
                    </View>


                    <View style={{flexDirection:'row',marginTop:5}}>
                      <View style={{flex:1}} >
                        {this.state.show&&this.state.teamList.length>0&&
                          <View style={{}}>
                            <View style={{}}>
                              <FlatList contentContainerStyle={{borderWidth:1,borderColor:'#F3F6FB',borderRadius:10,borderTopWidth:0,}}
                              data={this.state.teamList}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({item,index})=>{
                              return(
                                <View style={{marginVertical:0,backgroundColor:'#F3F6FB',borderColor:'#f2f2f2',paddingHorizontal:10,height:40,justifyContent:'center'}} >
                                  <TouchableOpacity onPress={()=>{this.setTeamList(item)}}>
                                    <View  style={{}} >
                                      <Text style={{color:'#000',fontSize:16,fontWeight:'600'}} numberOfLines={2}>{item.first_name} {item.last_name}</Text>
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              )}}
                              />
                            </View>
                          </View>
                        }
                      </View>
                    </View>
                  </View>

                  <View style={{flexDirection:'row',paddingVertical:15,paddingHorizontal:20,}}>
                     <View style={{paddingRight:7,flex:1}}>
                       <Text style={{color:"#000",fontWeight:'700',fontSize:16,paddingBottom:10}}>Team Unit</Text>
                        <DropDownPicker
                         items={this.state.unitList}
                         dropDownStyle={{backgroundColor:'#F3F6FB',borderWidth:1,marginTop:2,borderColor:'#F3F6FB'}}
                         defaultValue={this.state.selectedUnitList!=undefined?this.state.selectedUnitList.value:null}
                         placeholder="Team Unit"
                         arrowColor={'#000'}
                         dropDownMaxHeight={width*0.5}
                         style={{backgroundColor:'#F3F6FB',borderWidth:1,borderColor:'#F3F6FB',borderRadius:15}}
                         placeholderStyle={{fontWeight: 'bold',color:'#000'}}
                         labelStyle={{fontSize: 16, color: '#000',}}
                         containerStyle={{height: 45,width:'100%',borderRadius:15}}
                         onChangeItem={item =>{ this.setState({selectedUnitList:item})}}
                         />
                     </View>
                  </View>

                  <View style={{marginHorizontal:25,marginVertical:10,}}>
                   <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Is Support Team</Text>
                   <View style={{flexDirection:'row',}}>
                       <Switch
                         trackColor={{ false: "#767577", true: "#49cc5b" }}
                         thumbColor={this.state.isSupport ? "#fff" : "#f4f3f4"}
                         ios_backgroundColor="#3e3e3e"
                         onChange={()=>this.setState({isSupport:!this.state.isSupport})}
                         value={this.state.isSupport}
                       />
                   </View>
                 </View>


                  {this.renderFooter()}


               </ScrollView>

               <View>

                {this.renderModal()}
               </View>

            </View>
            <Toast ref={(toast) => this.toast = toast} style={[styles.shadow,{backgroundColor:'#fff'}]}
              position='bottom'
              positionValue={100}
              fadeInDuration={750}
              fadeOutDuration={1000}
              opacity={1}
              textStyle={{color:'#000'}}/>
          </View>
      );
    }
    renderFooter=()=>{
      return(
        <View style={{height:50,alignItems:'center',justifyContent:'center'}}>
          <TouchableOpacity onPress={()=>{this.save();}} style={{flex:1,justifyContent: 'center', alignItems: 'center',backgroundColor:'#132E5B',paddingHorizontal:25,borderRadius:15}}>
            <Text style={{color:'#fff',fontWeight:'700',fontSize:18}}>{this.state.editItem==null?'Save':'Update'}</Text>
          </TouchableOpacity>
       </View>
      )
    }
  }

  const styles = StyleSheet.create({
     container: {
       flex: 1,
     },
     shadow: {
       shadowColor: "#000",
       shadowOffset: {
         width: 0,
         height: 2,
       },
       shadowOpacity: 0.25,
       shadowRadius: 3.84,
       elevation: 0,
       borderColor:'#fff'
     },
     center:{
       alignItems:'center',
       justifyContent:'center'
     },
     iconStyle:{
       width:width*0.2,
       height:width*0.15,
       resizeMode:'contain'
     },
     iconContainer:{
       width: width*0.3,height:width*0.3,margin:0,padding:15,marginHorizontal:0,borderRadius:10,
     },
     iconText:{
       fontWeight:'700',color:'#444',fontSize:18,marginVertical:5
     },
     modalViewUpdate: {
       backgroundColor: '#fff',
       marginHorizontal: width*0.05 ,
       borderRadius:5,
    },
    modalView1:{
     backgroundColor: '#fff',
     marginHorizontal: 0 ,
     width:width
    }

   });

  export default CreateTeam
