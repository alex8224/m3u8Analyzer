# -*- coding:utf-8 -*-
import os
import requests
import hashlib

AD_MD5 = ("e896a34d58c8836b644e74a35f3b7789","4c2867a3028b213822d9bd3a05d540be", "a62d60ed1a0a62c9ca5664e41e9d8581", "21257ab8f017e598445d7d6903214631", "31816af2fc28cd06a98824b8faa5062f", "6731c6f6bdf9e3a46b43499bf5ed9888", "61037136461cef953dfa1a3ca86d6a02", "5879332f6020e7f3c212cf9c918ca2fe", "168ea44e7baaac021cf67bb0bd6fdd9a","a56d6be63fd3707c7f9437d5db9c67af", "a90028488f77237dd9e3ea79d6a8c43d", "7418638656be1ee65f55091ed905ef3f", "bf0348551b329e3911d913a63cd6807f", "3a22098e2db6479264bacf568f327742", "f895d33b73f61e0ff8ba507e1bb28193", "2d30cd0a44a59955aab487d2ee767cd6", "63d332b2f1e7e35ad058f2c00defe095", "1c26424ed421cee7890d3ab7a85bb85f")

def download_m3u8(url, user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6155.1 Safari/537.36"):
    headers = {'User-Agent': user_agent}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.text
    else:
        return None

def parse_m3u8_file(m3u8_content):

    segments = []
    current_duration = None

    for line in m3u8_content.split("\n"):
        line = line.strip()
        if line.startswith('#EXTINF:'):
            # Extract duration from #EXTINF tag
            current_duration = float(line.split(':')[1].split(',')[0])
        elif line and line.endswith('.ts'):
            # Non-empty line that is not a comment and ends with '.ts'
            segments.append({'duration': current_duration, 'url': line})
    return segments

def download_and_check_md5(url):
    response = requests.get(url)
    if response.status_code == 200:
        file_content = response.content
        return hashlib.md5(file_content).hexdigest()
    else:
        return None

def find_and_remove_ads(file_path, threshold=10, output_dir=""):
    m3u8_content = download_m3u8(file_path)
    segments = parse_m3u8_file(m3u8_content)
    print(f"total has {len(segments)} segments")

    for index, segment in enumerate(segments):
        duration = segment['duration']
        ts_url = segment['url']

        if duration < threshold:
            # Download the TS file and calculate its MD5
            md5 = download_and_check_md5(ts_url)
            # Remove the segment from the list if it's an ad
            if md5 in AD_MD5:  # Replace with the actual MD5 hash of the ad
                del segments[index]
            else:
                print(f"{md5} {index + 1} {duration} - {ts_url}")


    # Create a new M3U8 file without the ads
    new_m3u8_content = "#EXTM3U\n#EXT-X-ALLOW-CACHE:YES\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:16\n#EXT-X-PLAYLIST-TYPE:VOD\n"
    for segment in segments:
        new_m3u8_content += f"#EXTINF:{segment['duration']},\n{segment['url']}\n"
    new_m3u8_content += "#EXT-X-ENDLIST"

    with open(os.path.join(output_dir, "adfree.m3u8"), 'w') as f:
        f.write(new_m3u8_content)
    return "adfree.m3u8"

if __name__ == "__main__":
    m3u8_file_path = "https://m3u.haiwaikan.com/xm3u8/acce9f4003b5880c39651f0cd6e86f094415143a9705cdf947fe699244dcdb899921f11e97d0da21.m3u8"  # Replace with your actual M3U8 file path
    find_and_remove_ads(m3u8_file_path)
