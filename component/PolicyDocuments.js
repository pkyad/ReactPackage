import React from 'react';
import {
  Image,Platform,
  ScrollView,StyleSheet,
  Text,Button,TextInput,
  TouchableOpacity,View,
  Slider,ImageBackground,
  Dimensions, Alert,StatusBar,
  FlatList, AppState, BackHandler ,
  AsyncStorage,ActivityIndicator,
  ToastAndroid,RefreshControl,TouchableWithoutFeedback,Linking} from 'react-native';
import { createDrawerNavigator,DrawerItems, } from 'react-navigation-drawer';
import {SearchBar}from 'react-native-elements';
import { FontAwesome,Entypo ,MaterialIcons,Ionicons,AntDesign} from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import settings from './Constants.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { Switch } from 'react-native-switch';
import Modal from "react-native-modal";
import { Searchbar } from 'react-native-paper';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Card } from 'react-native-elements';
import  { HttpsClient }  from './HttpsClient.js';
import moment from 'moment';
import * as DocumentPicker from 'expo-document-picker';

const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url


import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

class PolicyDocuments extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const { params = {} } = navigation.state
      return {header:null}
  };

  constructor(props) {
    super(props);
    this.state={
      loadmore:false,
      offset:0,
      SERVER_URL:null,
      bool:false,
      policyList:[],
      year:moment(new Date()).format('YYYY'),
      file:null,
      modalShow:false,
      policyName:'',
      description:''
    }
     willFocus = props.navigation.addListener(
       'didFocus',
        payload => {
          this.changeVal()
          this.getPolicyList()
        }
     );
    }

    changeVal=()=>{
      this.setState({bool:!this.state.bool})
    }

  setServerurl=async()=>{
    const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
    this.setState({SERVER_URL:SERVER_URL})
  }

  componentDidMount(){
    this.setServerurl()
    this.getPolicyList()
  }

  getPolicyList=async()=>{
    var url = SERVER_URL + '/api/HR/document/'
    var data = await HttpsClient.get(url)
    if(data.type=='success'){
      this.setState({policyList:data.data})
    }else{
      return
    }
  }

  renderFooter=()=>{
    if(this.state.loadmore){
      return(
        <View style={{alignItems:'center',justifyContent:'center',marginTop:20}}>
          <TouchableOpacity style={{paddingHorizontal:15,paddingVertical:8,backgroundColor:themeColor}} onPress={()=>{this.getEmployeeList()}}>
            <Text style={{color:'#fff',fontSize:16}}>Load More</Text>
          </TouchableOpacity>
        </View>
      )
    }else{
      return null
    }

  }

  downloadPDf=async(item)=>{
    Linking.openURL(item.documentFile)
 }

 save=async(item,index)=>{
   var list = this.state.policyList
   if(this.state.file==null){
     return
   }
   if(this.state.policyName.length==0){
     return
   }

   var sendData = {
     name:this.state.policyName,
     documentFile:this.state.file,
     description:this.state.description,
     bodyType:'formData'
   }
   var serverurl = SERVER_URL + '/api/HR/document/'
   var data = await HttpsClient.post(serverurl,sendData)

   console.log(sendData,'dfbsbn',data,serverurl,item);
   if(data.type=='success'){
     list.push(data.data)
     this.setState({modalShow:false,policyList:list,policyName:'',file:null,description:''})
   }else{
     return
   }

 }

 _filePicker = async () => {
        try{

          let res = await DocumentPicker.getDocumentAsync({
            type: '*/*',
          });

          let filename = res.uri.split('/').pop();
          let match = /\.(\w+)$/.exec(filename);
          let type = match ? `application/${match[1]}` : `pdf`;

          const file = {
              uri: res.uri,
              type: type,
              name:filename,
          };

          this.setState({ file: file,modalShow:true});
        }catch (err) {
        }

      }

      renderModal=()=>{
       if(this.state.modalShow){
         return(
           <Modal isVisible={this.state.modalShow} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>{this.setState({modalShow:false,policyName:'',file:null,description:''})}} onBackdropPress={()=>{this.setState({modalShow:false,policyName:'',file:null,description:''})}} >
               <View style={[styles.modalViewUpdate,{overflow:'hidden',}]}>
               <ScrollView>
                <View style={{}}>
                    <Text style={{marginHorizontal:15,marginVertical:10,fontWeight:'700',fontSize:18}}>You are uploading a new Company Policy Document, Enter a name of this document and click "Save" button</Text>
                    <View style={{}}>
                     <View style={{}}>
                     <View style={{marginHorizontal:25,marginVertical:10}}>
                       <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Name</Text>
                       <View style={{flexDirection:'row',}}>
                            <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                              placeholder="Policy Name"
                              selectionColor={'#000'}
                              placeholderTextColor='rgba(0, 0, 0, 0.5)'
                              onChangeText={query => { this.setState({policyName:query})  }}
                              value={this.state.policyName}
                             />
                       </View>
                     </View>

                     <View style={{marginHorizontal:25,marginVertical:10}}>
                       <Text style={{color:'#000',fontSize:16,paddingBottom:10}}>Description(optional)</Text>
                       <View style={{flexDirection:'row',}}>
                            <TextInput style={{height: 50,borderWidth:1,borderColor:'#F3F6FB',width:'100%',borderRadius:10,backgroundColor:'#F3F6FB',paddingHorizontal:15,fontSize:16}}
                              placeholder="Description"
                              selectionColor={'#000'}
                              placeholderTextColor='rgba(0, 0, 0, 0.5)'
                              multiline={true}
                              onChangeText={query => {  this.setState({description:query})  }}
                              value={this.state.description}
                             />
                       </View>
                     </View>


                     </View>
                   </View>

                   <View style={{flexDirection:'row',marginVertical:10,marginBottom:20}}>
                      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                        <TouchableOpacity onPress={()=>{this.setState({modalShow:false,policyName:'',file:null,description:''})}} style={{backgroundColor:'#B50000',paddingHorizontal:25,paddingVertical:7,borderRadius:10}}>
                          <Text style={{color:'#fff',fontSize:18,}}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                        <TouchableOpacity onPress={()=>{this.save()}} style={{backgroundColor:'#132E5B',paddingHorizontal:25,paddingVertical:7,borderRadius:10}}>
                          <Text style={{color:'#fff',fontSize:18,}}>Save</Text>
                        </TouchableOpacity>
                      </View>
                   </View>
                </View>
               </ScrollView>
               </View>
             </Modal>
         )
       }else{
         return null
       }


    }

  render() {
    const { scanned } = this.state;
    return (
      <View style={{flex:1,backgroundColor:'#f3f3f3'}}>

            <Toast style={{backgroundColor:'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#142e5c'}}/>

            <View style={{flex:1}}>
              <View style={{height:55,backgroundColor:'#f3f3f3',}}>
                <View style={{flexDirection: 'row',height:55,alignItems: 'center',backgroundColor:'#f3f3f3'}}>
                   <TouchableOpacity onPress={()=>this.props.navigation.goBack()} style={{width:width*0.15,alignItems:'center',
                 justifyContent:'center'}}>
                     <MaterialIcons name={'keyboard-backspace'}size={30} color={'#252525'} />
                   </TouchableOpacity>
                   <View style={{width:width*0.85,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{color:'#252525',fontSize:20,fontWeight:'700',textAlign:'center',marginLeft:-(width*0.15)}}>Policy Documents</Text>
                   </View>
                </View>
              </View>
              <ScrollView contentContainerStyle={{paddingBottom:20}}>
                <Text style={{color:'#000',fontSize:18,fontWeight:'600',padding:15}}>Your employees can see these documents any time on the KloudERP portal or mobile app. You can upload documents like Leave policy , Advance money for any project and other SOP ( standard operating procedure ) document</Text>
                <FlatList
                 data={this.state.policyList}
                 contentContainerStyle={{paddingBottom:60}}
                 keyExtractor={(item,index) => {
                   return index.toString();
                 }}
                 extraData={this.state}
                 showsVerticalScrollIndicator={false}
                 nestedScrollEnabled={true}
                 ListFooterComponent={this.renderFooter()}
                 renderItem={({item, index}) =>{
                    var logo =  ''
                    if(logo!=null&&logo!=undefined){
                      logo = item.logo
                    }
                    return (
                       <TouchableWithoutFeedback onPress={()=>{}} >
                          <View style={{borderRadius:15,paddingHorizontal:15,backgroundColor:'#fff',marginVertical:12,paddingVertical:15,borderWidth:1,borderColor:'#e2e2e2'}}>
                          <View style={{flexDirection:'row',paddingBottom:10}}>
                            <View style={{flex:1}}>
                              <Text style={{color:'#000',fontSize:16,fontWeight:'600',}}>{item.name}</Text>
                            </View>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                              <Text style={{color:'#2C5AA7',fontSize:16,fontWeight:'600',}}>{moment(item.created).format('DD/MM/YYYY')}</Text>
                            </View>
                          </View>
                          <View style={{flexDirection:'row',paddingBottom:5}}>
                            <View style={{flex:1}}>
                              <Text style={{color:'#909090',fontSize:16,fontWeight:'600',}}>{item.description}</Text>
                            </View>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                              <TouchableOpacity onPress={()=>{this.downloadPDf(item)}} style={{flexDirection:'row'}}>
                                <Text style={{color:'#2C5AA7',fontSize:16,fontWeight:'600',marginRight:5}}>File</Text>
                                <AntDesign name="file1" size={20} color="#2C5AA7" />
                              </TouchableOpacity>
                            </View>
                          </View>

                        </View>
                      </TouchableWithoutFeedback>
                  )}}
                  />
              </ScrollView>
            </View>

            <TouchableOpacity onPress={()=>{this._filePicker()}}  style={[styles.boxshadow,{position:'absolute',right:20,bottom:20,width:46,height:46,borderRadius:23,backgroundColor:'grey',alignItems:'center',justifyContent:'center'}]}>
             <AntDesign name={'plus'} size={20} color={'#fff'}/>
            </TouchableOpacity>

            {this.renderModal()}

      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0,
    shadowRadius: 3.84,
    elevation: 3,
  },
  modalViewUpdate: {
   backgroundColor: '#fff',
   marginHorizontal: width*0.05 ,
   borderRadius:5,
  },
});


export default PolicyDocuments;
