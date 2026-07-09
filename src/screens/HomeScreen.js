import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthService from '../services/authService';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

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
        <Text style={styles.sectionTitle}>Fitur Aplikasi</Text>

        <MenuItem
          icon="thermometer-outline"
          title="Cek Cuaca"
          subtitle="Informasi cuaca real-time"
          color="#2196F3"
          onPress={() => navigation.navigate('Weather')}
        />

        <MenuItem
          icon="earth-outline"
          title="Analisis Cuaca Jabar"
          subtitle="Laporan & analisis wilayah Jawa Barat"
          color="#FF9800"
          onPress={() => navigation.navigate('JabarWeather')}
        />

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3F51B5" />
          <Text style={styles.infoText}>
            Aplikasi ini dibuat untuk UAS Mobile Programming 2026
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Informasi Aplikasi</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="cloudy-night" size={32} color="#FF9800" />
              <Text style={styles.statLabel}>Weather API</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="earth" size={32} color="#3F51B5" />
              <Text style={styles.statLabel}>Analisis Jabar</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={32} color="#E91E63" />
              <Text style={styles.statLabel}>Indeks Nyaman</Text>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mode === 'dark' ? 'rgba(63, 81, 181, 0.18)' : '#E8EAF6',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.mode === 'dark' ? '#9FA8DA' : '#3F51B5',
    lineHeight: 20,
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
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;
