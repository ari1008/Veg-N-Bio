import 'package:flutter/material.dart';

import 'custom_drawer.dart';

class CustomScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;

  const CustomScaffold({
    super.key,
    required this.title,
    required this.body,
    this.appBar,
    this.bottomNavigationBar,
  });

  void _onItemTap(BuildContext context, String label) {
    debugPrint("Tapped on $label");
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appBar ??
          AppBar(
            title: Text(
              title,
              style: const TextStyle(color: Colors.black),
            ),
            backgroundColor: Colors.white,
            iconTheme: const IconThemeData(color: Colors.black),
            elevation: 1,
          ),
      drawer: CustomDrawer(
        onItemTap: (label) => _onItemTap(context, label),
      ),
      backgroundColor: Colors.white,
      body: body,
      bottomNavigationBar: bottomNavigationBar,
    );
  }
}
