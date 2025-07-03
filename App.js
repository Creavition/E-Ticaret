import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Login from "./screens/Login";
import Register from './screens/Register';
import HomeScreen from './screens/HomeScreen';
import ProductDetail from './screens/ProductDetail';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CartProvider } from './contexts/CartContext'
import Payment from './screens/Payment';
import Filter from './screens/Filter';
import { ProductProvider } from './contexts/ProductContext';
import Home from './screens/Home';
import { FilterProvider } from './contexts/FilterContext';

const Stack = createNativeStackNavigator();

export default function App() {


  return (
    <FilterProvider>
      <ProductProvider>
        <CartProvider>
          <FavoritesProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={Login} options={{ title: 'Giriş Yap', headerShown: false }} />
                <Stack.Screen name="Register" component={Register} options={{ title: 'Register', headerShown: false }} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'HomeScreen', headerShown: false }} />
                <Stack.Screen name="Home" component={Home} options={{ title: 'Home', headerShown: false }} />
                <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ title: 'Ürün Detayı' }} />
                <Stack.Screen name="Payment" component={Payment} options={{ title: 'Payment' }} />
                <Stack.Screen name="Filter" component={Filter} options={{ title: 'Filter' }} />
              </Stack.Navigator>
            </NavigationContainer>
          </FavoritesProvider>
        </CartProvider>
      </ProductProvider>
    </FilterProvider>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
