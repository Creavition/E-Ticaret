import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

// Screens
import Login from "./screens/Login";
import Register from './screens/Register';
import HomeScreen from './screens/HomeScreen';
import ProductDetail from './screens/ProductDetail';
import Payment from './screens/Payment';
import Filter from './screens/Filter';
import Home from './screens/Home';
import OrderHistory from './screens/OrderHistory';
import ChangePassword from './screens/ChangePassword';

// Contexts
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { FilterProvider } from './contexts/FilterContext';
import { OrderProvider } from './contexts/OrderContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <OrderProvider>
          <FilterProvider>
            <ProductProvider>
              <CartProvider>
                <FavoritesProvider>
                  <NavigationContainer>
                    <Stack.Navigator initialRouteName="Login">
                      <Stack.Screen
                        name="Login"
                        component={Login}
                        options={{ title: 'Giriş Yap', headerShown: false }}
                      />
                      <Stack.Screen
                        name="Register"
                        component={Register}
                        options={{ title: 'Register', headerShown: false }}
                      />
                      <Stack.Screen
                        name="HomeScreen"
                        component={HomeScreen}
                        options={{ title: 'HomeScreen', headerShown: false }}
                      />
                      <Stack.Screen
                        name="Home"
                        component={Home}
                        options={{ title: 'Home', headerShown: false }}
                      />
                      <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetail}
                        options={{ title: 'Ürün Detayı' }}
                      />
                      <Stack.Screen
                        name="Payment"
                        component={Payment}
                        options={{ title: 'Payment', headerShown: false }}
                      />
                      <Stack.Screen
                        name="Filter"
                        component={Filter}
                        options={{ title: 'Filter' }}
                      />
                      <Stack.Screen
                        name="OrderHistory"
                        component={OrderHistory}
                        options={{ title: 'Order History', headerShown: false }}
                      />
                      <Stack.Screen
                        name="ChangePassword"
                        component={ChangePassword}
                        options={{ title: 'Change Password', headerShown: false }}
                      />
                    </Stack.Navigator>
                  </NavigationContainer>
                </FavoritesProvider>
              </CartProvider>
            </ProductProvider>
          </FilterProvider>
        </OrderProvider>
      </LanguageProvider>
    </ThemeProvider>
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
