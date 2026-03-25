import { Tabs } from 'expo-router';
import { Home, BookOpen, Search, User } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

export default function TabLayout() {
    const theme = Colors.light; // We can add useColorScheme later

    return (
        <Tabs
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
