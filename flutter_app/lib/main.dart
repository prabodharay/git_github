import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/customer_home_screen.dart';
import 'screens/driver_dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const LoadExApp());
}

class LoadExApp extends StatefulWidget {
  const LoadExApp({super.key});

  @override
  State<LoadExApp> createState() => _LoadExAppState();
}

class _LoadExAppState extends State<LoadExApp> {
  final ApiService _apiService = ApiService();
  String? _role;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LoadEx',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: _role == null
          ? LoginScreen(
              apiService: _apiService,
              onLoggedIn: (role) => setState(() => _role = role),
            )
          : _role == 'driver'
              ? DriverDashboardScreen(apiService: _apiService)
              : CustomerHomeScreen(apiService: _apiService),
    );
  }
}
