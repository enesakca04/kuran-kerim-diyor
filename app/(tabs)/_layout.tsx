import { Tabs } from 'expo-router';
import { Home, BookOpen, Search, User, Heart } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { View, StyleSheet, Platform, useColorScheme } from 'react-native';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    return (
        <Tabs
            backBehavior="history"
            screenOptions={{
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.muted,
                tabBarStyle: {
                    backgroundColor: theme.background,
                    borderTopColor: theme.border,
                },
                headerStyle: {
                    backgroundColor: theme.background,
                },
                headerTintColor: theme.text,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Kur'an",
                    // @ts-ignore
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="surahs"
                options={{
                    title: "Sureler",
                    // @ts-ignore
                    tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "", // No title to keep it clean, just the center button
                    tabBarIcon: ({ focused }) => (
                        <View style={[
                            styles.centerButton,
                            { backgroundColor: focused ? theme.primary : theme.background }
                        ]}>
                            {/* @ts-ignore */}
                            <Heart size={26} color={focused ? '#fff' : theme.muted} fill={focused ? '#fff' : 'transparent'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Arama",
                    // @ts-ignore
                    tabBarIcon: ({ color }) => <Search size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    // @ts-ignore
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    centerButton: {
        top: -10,
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
    }
});
