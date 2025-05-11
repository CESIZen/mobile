import React from 'react';
import {StyleSheet, Image, SafeAreaView, StatusBar, View} from 'react-native';

const Header = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#003f40" />
      <View>
        <Image source={require('../../assets/logoSvg.png')} style={styles.logo}/>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#003f40',
    paddingTop: StatusBar.currentHeight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    width: 250,
    height: 100,
    alignSelf: 'center',
  },
});

export default Header;