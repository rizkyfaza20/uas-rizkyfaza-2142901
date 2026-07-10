import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AuthService from '../services/authService';
import WeatherService from '../services/weatherService';
import { useTheme } from '../context/ThemeContext';

const FALLBACK_CITY = 'Bandung';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    fetchLocationWeather();
  }, []);

  const fetchLocationWeather = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      const result = await WeatherService.getWeatherByCity(FALLBACK_CITY);
      if (result.success) setCurrentWeather(result.data);
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const result = await WeatherService.getWeatherByCoords(loc.coords.latitude, loc.coords.longitude);
    if (result.success) {
      setCurrentWeather(result.data);
    } else {
      const fallback = await WeatherService.getWeatherByCity(FALLBACK_CITY);
      if (fallback.success) setCurrentWeather(fallback.data);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await AuthService.logout();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          }
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color="#fff" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Selamat Datang,</Text>
          <Text style={styles.userEmail}>{user?.email || 'User'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={isDark ? '#FFC107' : '#3F51B5'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Location Weather Snapshot */}
        {currentWeather && (
          <TouchableOpacity
            style={styles.weatherBanner}
            onPress={() => navigation.navigate('Weather')}
          >
            <View style={styles.weatherBannerLeft}>
              <Text style={styles.weatherBannerTitle}>{currentWeather.city}</Text>
              <Text style={styles.weatherBannerTemp}>{currentWeather.temperature}°C</Text>
              <Text style={styles.weatherBannerDesc}>{currentWeather.description}</Text>
            </View>
            <Image
              source={{ uri: WeatherService.getIconUrl(currentWeather.icon) }}
              style={styles.weatherBannerIcon}
            />
            <View style={styles.weatherBannerRight}>
              <Text style={styles.weatherBannerDetail}>{currentWeather.humidity}% RH</Text>
              <Text style={styles.weatherBannerDetail}>{currentWeather.windSpeed} m/s</Text>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Fitur Aplikasi</Text>

        <MenuItem
          icon="thermometer-outline"
          title="Cek Cuaca"
          subtitle="Informasi cuaca real-time detail"
          color="#2196F3"
          onPress={() => navigation.navigate('Weather')}
        />

        <MenuItem
          icon="earth-outline"
          title="Analisis Cuaca Jabar"
          subtitle="Perbandingan & analisis 10 kota Jawa Barat"
          color="#FF9800"
          onPress={() => navigation.navigate('JabarWeather')}
        />

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Tentang Aplikasi</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="cloudy-night" size={28} color="#FF9800" />
              <Text style={styles.statLabel}>Weather API</Text>
              <Text style={styles.statValue}>OpenWeatherMap</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="earth" size={28} color="#3F51B5" />
              <Text style={styles.statLabel}>Wilayah</Text>
              <Text style={styles.statValue}>10 Kota Jabar</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={28} color="#E91E63" />
              <Text style={styles.statLabel}>Analisis</Text>
              <Text style={styles.statValue}>Kenyamanan</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeButton: {
    padding: 8,
    marginRight: 4,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  weatherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3F51B5',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#3F51B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  weatherBannerLeft: {
    flex: 1,
  },
  weatherBannerTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  weatherBannerTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  weatherBannerDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  weatherBannerIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 10,
  },
  weatherBannerRight: {
    alignItems: 'flex-end',
  },
  weatherBannerDetail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
});

export default HomeScreen;
