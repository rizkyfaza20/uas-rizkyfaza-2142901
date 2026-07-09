import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WeatherService from '../services/weatherService';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// List of cities in West Java
const WEST_JAVA_CITIES = [
  { id: 'Bandung', name: 'Bandung', type: 'Highland', desc: 'Dataran Tinggi / Pegunungan (Sejuk & Lembab)' },
  { id: 'Bogor', name: 'Bogor', type: 'Highland', desc: 'Kota Hujan / Kaki Gunung (Curah Hujan Tinggi)' },
  { id: 'Bekasi', name: 'Bekasi', type: 'Lowland', desc: 'Dataran Rendah / Perkotaan (Cenderung Panas)' },
  { id: 'Depok', name: 'Depok', type: 'Lowland', desc: 'Urban / Penyangga Metropolitan (Lembab)' },
  { id: 'Cirebon', name: 'Cirebon', type: 'Coastal', desc: 'Pesisir Pantai Utara (Panas & Berangin)' },
  { id: 'Sukabumi', name: 'Sukabumi', type: 'Highland', desc: 'Pegunungan Selatan (Sejuk & Subur)' },
  { id: 'Garut', name: 'Garut', type: 'Highland', desc: 'Lembah Gunung Api (Dingin & Berbukit)' },
  { id: 'Karawang', name: 'Karawang', type: 'Lowland', desc: 'Dataran Rendah / Sentra Padi & Industri (Panas)' },
  { id: 'Indramayu', name: 'Indramayu', type: 'Coastal', desc: 'Pesisir Pantai Utara / Agraris & Nelayan (Sangat Panas)' },
  { id: 'Tasikmalaya', name: 'Tasikmalaya', type: 'Highland', desc: 'Daerah Perbukitan Priangan Timur (Sejuk-Sedang)' },
];

// Representative cities for West Java comparison dashboard
const REGIONAL_COMPARE_CITIES = ['Bandung', 'Bekasi', 'Cirebon', 'Bogor', 'Indramayu'];

export default function JabarWeatherScreen() {
  const [selectedCity, setSelectedCity] = useState(WEST_JAVA_CITIES[0]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Regional Comparison Data State
  const [regionalData, setRegionalData] = useState([]);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [regionalStats, setRegionalStats] = useState(null);

  // Fetch individual city weather
  const fetchCityWeather = async (cityObj) => {
    setLoading(true);
    const result = await WeatherService.getWeatherByCity(cityObj.name);
    setLoading(false);
    if (result.success) {
      setWeather(result.data);
      setSelectedCity(cityObj);
    } else {
      Alert.alert('Gagal Mengambil Data', `Tidak dapat memuat cuaca untuk ${cityObj.name}.`);
    }
  };

  // Fetch comparison data for representative cities
  const fetchRegionalComparison = async () => {
    setLoadingCompare(true);
    try {
      const promises = REGIONAL_COMPARE_CITIES.map(name => WeatherService.getWeatherByCity(name));
      const results = await Promise.all(promises);

      const successfulData = results
        .filter(res => res.success)
        .map(res => res.data);

      setRegionalData(successfulData);

      if (successfulData.length > 0) {
        // Calculate regional statistics
        const temps = successfulData.map(d => d.temperature);
        const humidities = successfulData.map(d => d.humidity);

        const avgTemp = Math.round(temps.reduce((sum, t) => sum + t, 0) / temps.length);

        const hottest = successfulData.reduce((prev, curr) =>
          curr.temperature > prev.temperature ? curr : prev, successfulData[0]);

        const coldest = successfulData.reduce((prev, curr) =>
          curr.temperature < prev.temperature ? curr : prev, successfulData[0]);

        const wettest = successfulData.reduce((prev, curr) =>
          curr.humidity > prev.humidity ? curr : prev, successfulData[0]);

        setRegionalStats({
          avgTemp,
          hottest: { name: hottest.city, temp: hottest.temperature },
          coldest: { name: coldest.city, temp: coldest.temperature },
          wettest: { name: wettest.city, humidity: wettest.humidity }
        });
      }
    } catch (error) {
      console.error('Error fetching regional comparison:', error);
    } finally {
      setLoadingCompare(false);
    }
  };

  useEffect(() => {
    fetchCityWeather(WEST_JAVA_CITIES[0]);
    fetchRegionalComparison();
  }, []);

  // Comfort Index Analysis Formulation
  const getComfortAnalysis = (temp, humidity) => {
    if (temp < 22) {
      return {
        level: 'Sangat Nyaman / Sejuk',
        color: '#4CAF50',
        barWidth: '30%',
        tip: 'Udara pegunungan yang segar dan sejuk. Sangat nyaman untuk beraktivitas luar ruangan. Tetap bawa jaket tipis jika angin kencang.'
      };
    } else if (temp >= 22 && temp < 27) {
      if (humidity < 70) {
        return {
          level: 'Nyaman',
          color: '#8BC34A',
          barWidth: '60%',
          tip: 'Suhu ideal untuk sebagian besar kegiatan. Kondisi udara optimal dan tingkat kelembaban seimbang.'
        };
      } else {
        return {
          level: 'Cukup Nyaman / Hangat Lembab',
          color: '#CDDC39',
          barWidth: '70%',
          tip: 'Udara terasa sedikit hangat dan lengket karena kelembaban tinggi. Gunakan pakaian berbahan katun longgar.'
        };
      }
    } else if (temp >= 27 && temp < 32) {
      if (humidity < 65) {
        return {
          level: 'Hangat',
          color: '#FFC107',
          barWidth: '80%',
          tip: 'Suhu mulai terasa hangat. Baik untuk menjemur pakaian atau hasil pertanian, namun batasi paparan matahari langsung di siang hari.'
        };
      } else {
        return {
          level: 'Gerah / Kurang Nyaman',
          color: '#FF9800',
          barWidth: '88%',
          tip: 'Kombinasi suhu hangat dan kelembaban tinggi memicu gerah berlebih. Pastikan sirkulasi udara ruangan terjaga dengan baik.'
        };
      }
    } else {
      return {
        level: 'Sangat Gerah / Panas Ekstrem',
        color: '#F44336',
        barWidth: '100%',
        tip: 'Suhu sangat tinggi. Risiko dehidrasi meningkat. Disarankan menghindari aktivitas fisik berat di luar ruangan dan minum air putih ekstra.'
      };
    }
  };

  // Activity recommendations based on weather description/parameters
  const getActivityRecommendation = (weatherData) => {
    const desc = weatherData.description.toLowerCase();
    const temp = weatherData.temperature;

    if (desc.includes('hujan') || desc.includes('gerimis') || desc.includes('petir')) {
      return {
        title: 'Saran Cuaca Basah / Hujan',
        icon: 'umbrella-outline',
        color: '#2196F3',
        text: 'Siapkan payung/jas hujan sebelum keluar. Pengendara motor harap berhati-hati dengan genangan air dan jalan licin. Kurangi kecepatan berkendara.'
      };
    }

    if (temp >= 32) {
      return {
        title: 'Saran Cuaca Panas Terik',
        icon: 'thermometer-outline',
        color: '#F44336',
        text: 'Gunakan tabir surya (sunscreen) dan pelindung kepala jika keluar rumah. Ideal untuk pengeringan komoditas pertanian tapi waspadai dehidrasi tubuh.'
      };
    }

    return {
      title: 'Saran Cuaca Kondusif',
      icon: 'sparkles-outline',
      color: '#4CAF50',
      text: 'Cuaca sangat mendukung untuk aktivitas luar ruangan seperti berolahraga, wisata alam Jawa Barat, bercocok tanam, atau bepergian.'
    };
  };

  const comfort = weather ? getComfortAnalysis(weather.temperature, weather.humidity) : null;
  const activityTip = weather ? getActivityRecommendation(weather) : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analisis Cuaca Jawa Barat</Text>
        <Text style={styles.headerSubtitle}>Laporan Real-Time & Analisis Regional</Text>
      </View>

      {/* City Quick Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.sectionTitle}>Pilih Wilayah Jabar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
          {WEST_JAVA_CITIES.map((city) => {
            const isSelected = selectedCity.id === city.id;
            return (
              <TouchableOpacity
                key={city.id}
                style={[styles.cityChip, isSelected && styles.cityChipSelected]}
                onPress={() => fetchCityWeather(city)}
              >
                <Text style={[styles.cityChipText, isSelected && styles.cityChipTextSelected]}>
                  {city.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Weather Information */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={styles.loadingText}>Memuat analisis cuaca...</Text>
        </View>
      ) : weather ? (
        <View style={styles.mainContent}>
          {/* Main Info Card */}
          <View style={styles.weatherCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cityNameText}>{weather.city}</Text>
                <Text style={styles.cityDescText}>{selectedCity.desc}</Text>
              </View>
              <Image
                source={{ uri: WeatherService.getIconUrl(weather.icon) }}
                style={styles.weatherIcon}
              />
            </View>

            <View style={styles.tempRow}>
              <Text style={styles.tempText}>{weather.temperature}°C</Text>
              <View style={styles.weatherConditionBox}>
                <Text style={styles.conditionText}>{weather.description}</Text>
                <Text style={styles.feelsLikeText}>Terasa seperti {weather.feelsLike}°C</Text>
              </View>
            </View>

            <View style={styles.gridParams}>
              <View style={styles.paramItem}>
                <Ionicons name="water" size={20} color="#2196F3" />
                <Text style={styles.paramLabel}>Kelembaban</Text>
                <Text style={styles.paramValue}>{weather.humidity}%</Text>
              </View>
              <View style={styles.paramItem}>
                <Ionicons name="wind" size={20} color="#4CAF50" />
                <Text style={styles.paramLabel}>Kec. Angin</Text>
                <Text style={styles.paramValue}>{weather.windSpeed} m/s</Text>
              </View>
              <View style={styles.paramItem}>
                <Ionicons name="speedometer" size={20} color="#9C27B0" />
                <Text style={styles.paramLabel}>Tekanan</Text>
                <Text style={styles.paramValue}>{weather.pressure} hPa</Text>
              </View>
            </View>
          </View>

          {/* Weather & Comfort Analysis Dashboard */}
          <Text style={styles.sectionTitle}>Analisis Kenyamanan & Lingkungan</Text>

          <View style={styles.analysisCard}>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Indeks Kenyamanan:</Text>
              <Text style={[styles.comfortStatusText, { color: comfort?.color }]}>
                {comfort?.level}
              </Text>
            </View>
            {/* Custom visual progress bar gauge */}
            <View style={styles.gaugeBackground}>
              <View style={[styles.gaugeFill, { width: comfort?.barWidth, backgroundColor: comfort?.color }]} />
            </View>
            <Text style={styles.analysisTipText}>{comfort?.tip}</Text>
          </View>

          {/* Geographical Profile Tip Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Ionicons
                name={
                  selectedCity.type === 'Highland' ? 'triangle-outline' :
                  selectedCity.type === 'Coastal' ? 'boat-outline' : 'business-outline'
                }
                size={22}
                color="#607D8B"
              />
              <Text style={styles.profileTitle}>Profil Geografis: {selectedCity.type}</Text>
            </View>
            <Text style={styles.profileText}>
              {selectedCity.type === 'Highland' &&
                'Wilayah ini berada di dataran tinggi Jawa Barat. Karakteristik utama adalah suhu harian sejuk dengan kelembaban tinggi. Pada musim hujan, waspadai potensi kabut tebal yang dapat mengganggu jarak pandang berkendara.'}
              {selectedCity.type === 'Coastal' &&
                'Wilayah pesisir utara (Pantura) Jawa Barat. Angin laut bertiup lebih kencang dengan suhu udara cenderung tinggi sepanjang hari. Kelembaban seringkali dipengaruhi oleh penguapan air laut.'}
              {selectedCity.type === 'Lowland' &&
                'Kawasan dataran rendah perkotaan atau industri. Suhu relatif tinggi dikarenakan akumulasi panas area terbangun (Urban Heat Island). Sirkulasi udara bersih perlu diperhatikan.'}
            </Text>
          </View>

          {/* Outdoor Activity Tip Card */}
          {activityTip && (
            <View style={[styles.tipCard, { borderLeftColor: activityTip.color }]}>
              <View style={styles.tipHeader}>
                <Ionicons name={activityTip.icon} size={22} color={activityTip.color} />
                <Text style={[styles.tipTitle, { color: activityTip.color }]}>{activityTip.title}</Text>
              </View>
              <Text style={styles.tipText}>{activityTip.text}</Text>
            </View>
          )}

          {/* Regional West Java Overview Panel */}
          <View style={styles.regionalSection}>
            <View style={styles.regionalHeaderRow}>
              <Text style={styles.sectionTitle}>Analisis Regional Jabar</Text>
              <TouchableOpacity onPress={fetchRegionalComparison} style={styles.refreshBtn}>
                <Ionicons name="refresh" size={16} color="#FF9800" />
                <Text style={styles.refreshBtnText}>Muat Ulang</Text>
              </TouchableOpacity>
            </View>

            {loadingCompare ? (
              <View style={styles.loadingBoxMini}>
                <ActivityIndicator size="small" color="#FF9800" />
              </View>
            ) : regionalStats ? (
              <View>
                {/* 3 mini stats cards in a row */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxNum}>{regionalStats.avgTemp}°C</Text>
                    <Text style={styles.statBoxLabel}>Rata-rata Suhu</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statBoxNum, { color: '#F44336' }]}>{regionalStats.hottest.temp}°C</Text>
                    <Text style={styles.statBoxLabel}>Terpanas ({regionalStats.hottest.name})</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statBoxNum, { color: '#2196F3' }]}>{regionalStats.coldest.temp}°C</Text>
                    <Text style={styles.statBoxLabel}>Terdingin ({regionalStats.coldest.name})</Text>
                  </View>
                </View>

                {/* Horizontal list of representative cities */}
                <Text style={styles.comparisonSubTitle}>Kondisi Kota Pembanding</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.compareListScroll}>
                  {regionalData.map((data, index) => (
                    <View key={index} style={styles.compareMiniCard}>
                      <Text style={styles.compareMiniName}>{data.city}</Text>
                      <Image
                        source={{ uri: WeatherService.getIconUrl(data.icon) }}
                        style={styles.compareMiniIcon}
                      />
                      <Text style={styles.compareMiniTemp}>{data.temperature}°C</Text>
                      <Text style={styles.compareMiniHum}>💧 {data.humidity}%</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <Text style={styles.errorText}>Gagal memuat visual perbandingan regional.</Text>
            )}
          </View>
        </View>
      ) : null}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    backgroundColor: '#3F51B5',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  selectorContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  cityScroll: {
    flexDirection: 'row',
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  cityChipSelected: {
    backgroundColor: '#3F51B5',
    borderColor: '#3F51B5',
  },
  cityChipText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  cityChipTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 14,
  },
  mainContent: {
    padding: 15,
  },
  weatherCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  cityDescText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weatherIcon: {
    width: 60,
    height: 60,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  tempText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 15,
  },
  weatherConditionBox: {
    justifyContent: 'center',
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  feelsLikeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gridParams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 15,
    marginTop: 5,
  },
  paramItem: {
    alignItems: 'center',
    flex: 1,
  },
  paramLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  paramValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  analysisCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 15,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  comfortStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  gaugeBackground: {
    height: 8,
    backgroundColor: colors.mode === 'dark' ? '#333333' : '#ECEFF1',
    borderRadius: 4,
    width: '100%',
    marginBottom: 12,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  analysisTipText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  profileCard: {
    backgroundColor: colors.mode === 'dark' ? '#1a2226' : '#F7F9FA',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.mode === 'dark' ? '#B0BEC5' : '#455A64',
    marginLeft: 8,
  },
  profileText: {
    fontSize: 12.5,
    color: colors.mode === 'dark' ? '#90A4AE' : '#546E7A',
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 5,
    marginBottom: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  regionalSection: {
    marginTop: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  regionalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  refreshBtnText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  loadingBoxMini: {
    padding: 20,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginHorizontal: 3,
  },
  statBoxNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  statBoxLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  comparisonSubTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 10,
  },
  compareListScroll: {
    flexDirection: 'row',
  },
  compareMiniCard: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
    width: 90,
  },
  compareMiniName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text,
  },
  compareMiniIcon: {
    width: 36,
    height: 36,
  },
  compareMiniTemp: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  compareMiniHum: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 12,
  }
});
