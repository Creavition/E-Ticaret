import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import { Ionicons } from '@expo/vector-icons';
import Cart from '../screens/Cart';
import Favorites from '../screens/Favorites';
import Account from '../screens/Account';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

export default function BottomTab() {
    const { theme, isDarkMode } = useTheme();
    
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#ce6302',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: isDarkMode ? theme.surface : '#fff',
                },
                headerShown: false, // Tüm tab'lar için header'ı gizle
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={Favorites}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'heart' : 'heart-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Cart"
                component={Cart}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'cart' : 'cart-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Account"
                component={Account}
                options={{
                    headerShown: false, // Account için özel olarak header'ı gizle
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

        </Tab.Navigator>

    );
}
