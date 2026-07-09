import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WeatherService from '../services/weatherService';
import { useTheme } from '../context/ThemeContext';

const WeatherScreen = () => {
  const [city, setCity] = useState('Jakarta');
  const [searchInput, setSearchInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      Alert.alert('Error', 'Masukkan nama kota');
      return;
    }

    setLoading(true);
    const result = await WeatherService.getWeatherByCity(cityName);
    setLoading(false);

    if (result.success) {
      setWeather(result.data);
      setCity(cityName);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleSearch = () => {
    fetchWeather(searchInput);
  };

  // Load default city on mount
  useEffect(() => {
    fetchWeather('Jakarta');
  }, []);

  const WeatherCard = ({ icon, label, value, color }) => (
    <View style={[styles.weatherCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cek Cuaca</Text>
        <Text style={styles.headerSubtitle}>Informasi cuaca real-time</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Masukkan nama kota..."
            placeholderTextColor={colors.textMuted}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Cari</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Mengambil data cuaca...</Text>
        </View>
      ) : weather ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Weather Info */}
          <View style={styles.mainCard}>
            <Text style={styles.cityName}>
              {weather.city}, {weather.country}
            </Text>
            <Image
              source={{ uri: WeatherService.getIconUrl(weather.icon) }}
              style={styles.weatherIcon}
            />
            <Text style={styles.temperature}>{weather.temperature}°C</Text>
            <Text style={styles.description}>
              {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
            </Text>
            <Text style={styles.feelsLike}>
              Terasa seperti {weather.feelsLike}°C
            </Text>
          </View>

          {/* Weather Details Grid */}
          <View style={styles.detailsGrid}>
            <WeatherCard
              icon="water-outline"
              label="Kelembaban"
              value={`${weather.humidity}%`}
              color="#2196F3"
            />
            <WeatherCard
              icon="speedometer-outline"
              label="Tekanan"
              value={`${weather.pressure} hPa`}
              color="#9C27B0"
            />
            <WeatherCard
              icon="wind-outline"
              label="Angin"
              value={`${weather.windSpeed} m/s`}
              color="#4CAF50"
            />
            <WeatherCard
              icon="eye-outline"
              label="Visibilitas"
              value={`${(weather.visibility / 1000).toFixed(1)} km`}
              color="#FF9800"
            />
          </View>

          {/* Sunrise/Sunset */}
          <View style={styles.sunCard}>
            <View style={styles.sunItem}>
              <Ionicons name="sunny-outline" size={32} color="#FF9800" />
              <View style={styles.sunTextContainer}>
                <Text style={styles.sunLabel}>Matahari Terbit</Text>
                <Text style={styles.sunValue}>{weather.sunrise}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.sunItem}>
              <Ionicons name="moon-outline" size={32} color="#5C6BC0" />
              <View style={styles.sunTextContainer}>
                <Text style={styles.sunLabel}>Matahari Terbenam</Text>
                <Text style={styles.sunValue}>{weather.sunset}</Text>
              </View>
            </View>
          </View>

          {/* Quick Cities */}
          <Text style={styles.sectionTitle}>Kota Populer</Text>
          <View style={styles.quickCities}>
            {['Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta', 'Bali'].map((cityName) => (
              <TouchableOpacity
                key={cityName}
                style={styles.cityButton}
                onPress={() => {
                  setSearchInput(cityName);
                  fetchWeather(cityName);
                }}
              >
                <Text style={styles.cityButtonText}>{cityName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cityName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  temperature: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  description: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  feelsLike: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 5,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  weatherCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  sunCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginTop: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sunItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sunTextContainer: {
    marginLeft: 15,
  },
  sunLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sunValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  quickCities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  cityButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityButtonText: {
    color: '#2196F3',
    fontSize: 14,
  },
});

export default WeatherScreen;
