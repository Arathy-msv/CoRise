Add-Type -AssemblyName System.Runtime.WindowsRuntime

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]

function AwaitOperation($winRtTask, $resultType) {
  $asTask = $asTaskGeneric.MakeGenericMethod($resultType)
  $netTask = $asTask.Invoke($null, @($winRtTask))
  $netTask.Wait(-1) | Out-Null
  if ($netTask.IsFaulted) { throw $netTask.Exception }
  $netTask.Result
}

function AwaitProgress($winRtAction) {
  $method = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncActionWithProgress`1'
  })[0]
  $asTask = $method.MakeGenericMethod([double])
  $netTask = $asTask.Invoke($null, @($winRtAction))
  $netTask.Wait(-1) | Out-Null
  if ($netTask.IsFaulted) { throw $netTask.Exception }
}

$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Transcoding.MediaTranscoder, Windows.Media.Transcoding, ContentType = WindowsRuntime]
$null = [Windows.Media.Transcoding.PrepareTranscodeResult, Windows.Media.Transcoding, ContentType = WindowsRuntime]
$null = [Windows.Media.MediaProperties.MediaEncodingProfile, Windows.Media.MediaProperties, ContentType = WindowsRuntime]

$inputPath = "c:\Projects\CoRise\demo-video\corise-saas-walkthrough.avi"
$downloads = Join-Path $env:USERPROFILE "Downloads"
$outPath = Join-Path $downloads "corise-saas-walkthrough.mp4"
if (Test-Path $outPath) { Remove-Item -LiteralPath $outPath -Force }

$inputFile = AwaitOperation ([Windows.Storage.StorageFile]::GetFileFromPathAsync($inputPath)) ([Windows.Storage.StorageFile])
$folder = AwaitOperation ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync($downloads)) ([Windows.Storage.StorageFolder])
$outFile = AwaitOperation ($folder.CreateFileAsync("corise-saas-walkthrough.mp4", [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])

$profile = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateMp4([Windows.Media.MediaProperties.VideoEncodingQuality]::HD720p)
$transcoder = [Windows.Media.Transcoding.MediaTranscoder]::new()
$prepared = AwaitOperation ($transcoder.PrepareFileTranscodeAsync($inputFile, $outFile, $profile)) ([Windows.Media.Transcoding.PrepareTranscodeResult])
if (-not $prepared.CanTranscode) {
  throw "Cannot transcode: $($prepared.FailureReason)"
}
AwaitProgress ($prepared.TranscodeAsync())
Get-Item -LiteralPath $outPath | Select-Object FullName, Length
