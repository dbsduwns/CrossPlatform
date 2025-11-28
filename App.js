import 'react-native-gesture-handler';
import { View, Text, Button, ScrollView, Image, StyleSheet, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContent } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TodoScreen from './TodoScreen';
import WeatherScreen from './weather';
import { AuthProvider, useAuth, LoginScreen } from './login.js';
import ChatScreenApp from './ChatScreen.js'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';

let projcetURI = "https://blog.naver.com/PostView.naver?blogId=yeojun7429&Redirect=View&logNo=224066562332&categoryNo=1&isAfterWrite=true&isMrblogPost=false&isHappyBeanLeverage=true&contentLength=5853"

function ProfileScreen({ navigation }) {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
      }}
    >
      <Image source={require('./assets/kangnam.png')} style={styles.logo} />
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 50 }}>👤 프로필</Text>
      <Text style={{ textAlign: 'auto' }}>
        ✅ 이름: 윤여준{'\n'}
        ✅ 대학: 강남대학교 ICT융합공학부 {'\n'}
        ✅ 관심 분야: 데이터베이스 · 리액트 네이티브 {'\n'}
      </Text>
      <Button title="연락처로 이동" onPress={() => navigation.navigate('ContactTab')} />
    </ScrollView>
  );
}

function PortfolioList({ navigation }) {
  return (
    <View style={{ flex: 1, padding: 24, gap: 12, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>📁 포트폴리오</Text>
      <Button
        title="프로젝트 A 상세"
        onPress={() => navigation.navigate('ProjectDetail', { id: 'A' })}
      />
      <Button
        title="프로젝트 B 상세"
        onPress={() => navigation.navigate('ProjectDetail', { id: 'B' })}
      />
    </View>
  );
}

function ProjectDetail({ route, navigation }) {
  const { id } = route.params ?? {};
  return (
    <View style={{ flex: 1, padding: 24, gap: 12, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24 }}>프로젝트 상세: {id}</Text>
      <Text>- 💻 프로젝트 명: Future Generation</Text>
      <Text>- 📈 기술 스택: React Native, TensorFlow, Keras</Text>
      <Text>- 👪 참여자: Jake, Thomas, Eric, Victor</Text>
      <Button title="프로젝트 OverView" onPress={() => navigation.navigate('ProjectModal')}/>
      <Button title="뒤로" onPress={() => navigation.goBack()} />
    </View>
  );
}

function ProjectModalScreen() {
  return (
    <WebView
      source={{ uri: projcetURI }}
      style={{ flex: 1 }}
    />
  );
}

function ContactScreen() {
  return (
    <View style={{ flex: 1, padding: 24, gap: 12, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>📫 연락처</Text>
      <Text>📩 이메일: yeojun8765@gmail.com</Text>
      <Text>👨‍💻 GitHub: github.com/yourid</Text>
      <Text>🔗 LinkedIn: linkedin.com/in/yourid</Text>
    </View>
  );
}

function BlogScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>✍️ 블로그</Text>
      <Text>- 블로그명: Jake</Text>
      <Text>- Autoencoder 강의 노트</Text>
      <Text>- LSTM 역전파 메모</Text>
      <Text>- Expo Router vs React Navigation</Text>
      <Button title='블로그 이동' onPress={() => navigation.navigate('BlogModal')}/>
    </ScrollView>
  );
}

function BlogModalScreen() {
  return (
    <WebView 
      source={{ uri: "https://blog.naver.com/yeojun7429" }}
      style={{ flex: 1 }}
    />
  )
}

/** ========== 네비게이터 구성 ========== */
const PortfolioStackNav = createNativeStackNavigator();
function PortfolioStack() {
  return (
    <PortfolioStackNav.Navigator
      screenOptions={{ headerTitleAlign: 'center', headerShown: false }}
    >
      <PortfolioStackNav.Screen
        name="PortfolioList"
        component={PortfolioList}
        options={{ title: '포트폴리오' }}
      />
      <PortfolioStackNav.Screen
        name="ProjectDetail"
        component={ProjectDetail}
        options={{ title: '프로젝트 상세' }}
      />
    </PortfolioStackNav.Navigator>
  );
}

const Tab = createBottomTabNavigator();
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: '프로필',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused ? require('./assets/button_b.png') : require('./assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="PortfolioTab"
        component={PortfolioStack}
        options={{
          title: '포트폴리오',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused ? require('./assets/button_b.png') : require('./assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="BlogTab"
        component={BlogScreen}
        options={{
          title: '블로그',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused ? require('./assets/button_b.png') : require('./assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ContactTab"
        component={ContactScreen}
        options={{
          title: '연락처',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused ? require('./assets/button_b.png') : require('./assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="weather"
        component={WeatherScreen}
        options={{
          title: '날씨',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused ? require('./assets/button_b.png') : require('./assets/button_r.png')
              }
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AboutScreen() {
  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>ℹ️ 사이트 소개</Text>
      <Text>개인 포트폴리오 · 블로그 · 연락처를 한 곳에</Text>
    </View>
  );
}

function CustomDrawerContent(props) {
  const { signOut } = useAuth();

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList { ...props }/>
      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}/>
      <DrawerItem 
        label="로그아웃"
        onPress={() => {
          signOut();
        }}
        labelStyle={{ color: 'red', fontWeight: 'bold' }}
      />
    </DrawerContentScrollView>
  );
}

function MainDrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props}/>}>
      <Drawer.Screen name="Home" component={MainTabs} options={{ title: '홈(탭)' }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: '소개' }} />
      <Drawer.Screen name="Todo" component={TodoScreen} options={{title: '일정관리'}} />
      <Drawer.Screen name="Chat" component={ChatScreenApp} options={{title: '채팅'}} />
    </Drawer.Navigator>
  );
}

const RootStack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="MainDrawer"
        component={MainDrawerNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="BlogModal"
        component={BlogModalScreen}
        options={{
          presentation: 'modal',
          title: '블로그 보기',
        }}
      />
      <RootStack.Screen
        name="ProjectModal"
        component={ProjectModalScreen}
        options={{
          presentation: 'modal',
          title: '프로젝트 개요',
        }}
      />
    </RootStack.Navigator>
  );
}

function NavigationContent() {
  const { isAuthenticated } = useAuth();
  return (
    <NavigationContainer>
        {isAuthenticated ? (
        <RootNavigator />
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  )
}

const Drawer = createDrawerNavigator();
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContent />
      </AuthProvider>
    </GestureHandlerRootView>
    
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
    marginTop: 50,
  },
});