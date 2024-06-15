Page license
Page components
Page directory
Page instfiles
UninstPage uninstConfirm
UninstPage instfiles

Name "Krosno Desktop"

LicenseText " \
	University of Warsaw's Inkrementalna Iglica$\n \
	Anh Dinh Trong, Krzysztof Żyndul, Piotr Trzaskowski, Krzysztof Olszak \
"
LicenseData ..\LICENSE

InstallDir "$PROGRAMFILES64\Krosno Desktop"

Section audio-capturer
	SetOutPath "$INSTDIR"
	File ..\deps\rdp-audio-capturer-install.exe
	Exec "$INSTDIR\rdp-audio-capturer-install.exe"
SectionEnd

Section krosno-desktop
	SetOutPath "$INSTDIR"
	File /r ..\out\krosno-desktop-win32-x64
	CreateDirectory "$SMPROGRAMS\InkrementalnaIglica"
	CreateShortcut "$SMPROGRAMS\InkrementalnaIglica\Krosno Desktop.lnk" "$INSTDIR\krosno-desktop-win32-x64\krosno-desktop.exe"
	CreateShortcut "$DESKTOP\Krosno Desktop.lnk" "$INSTDIR\krosno-desktop-win32-x64\krosno-desktop.exe"  ; Create a desktop shortcut
	WriteUninstaller "$INSTDIR\uninstall.exe"

    Exec "$INSTDIR\krosno-desktop-win32-x64\krosno-desktop.exe"
SectionEnd

Section Uninstall
	Delete "$INSTDIR\uninstall.exe"
	RMDir /r "$INSTDIR\krosno-desktop-win32-x64"
	Delete "$SMPROGRAMS\InkrementalnaIglica\krosno-desktop.lnk"
	Delete "$INSTDIR\rdp-audio-capturer-install.exe"
	RMDir "$INSTDIR"
SectionEnd
