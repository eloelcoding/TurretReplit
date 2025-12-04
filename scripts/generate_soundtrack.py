"""Generate a dramatic sci-fi soundtrack with heavy drums and bass."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, filtfilt
from pathlib import Path


def lowpass_filter(data, cutoff, sample_rate, order=4):
    """Apply a lowpass filter to the audio data."""
    nyquist = 0.5 * sample_rate
    normalized_cutoff = min(cutoff / nyquist, 0.99)
    b, a = butter(order, normalized_cutoff, btype='low', analog=False)
    return filtfilt(b, a, data)


def highpass_filter(data, cutoff, sample_rate, order=4):
    """Apply a highpass filter to the audio data."""
    nyquist = 0.5 * sample_rate
    normalized_cutoff = max(cutoff / nyquist, 0.01)
    b, a = butter(order, normalized_cutoff, btype='high', analog=False)
    return filtfilt(b, a, data)


def generate_kick(t_hit, sample_rate):
    """Generate a punchy electronic kick drum."""
    # Pitch envelope - starts high, drops fast
    pitch_env = np.exp(-40 * t_hit)
    freq = 150 * pitch_env + 45  # Drops from 195Hz to 45Hz
    
    phase = 2 * np.pi * np.cumsum(freq) / sample_rate
    kick = np.sin(phase)
    
    # Add punch/click at start
    click = np.sin(2 * np.pi * 1500 * t_hit) * np.exp(-200 * t_hit)
    kick += click * 0.4
    
    # Amplitude envelope
    amp_env = np.exp(-8 * t_hit)
    kick *= amp_env
    
    return kick


def generate_snare(t_hit, sample_rate):
    """Generate an electronic snare with body and noise."""
    # Tonal body
    body_freq = 200 * np.exp(-20 * t_hit) + 120
    phase = 2 * np.pi * np.cumsum(body_freq) / sample_rate
    body = np.sin(phase) * np.exp(-15 * t_hit)
    
    # Noise component (the "snap")
    noise = np.random.randn(len(t_hit))
    noise = highpass_filter(noise, 2000, sample_rate)
    noise_env = np.exp(-20 * t_hit)
    noise *= noise_env
    
    return body * 0.6 + noise * 0.7


def generate_hihat(t_hit, sample_rate, open_hat=False):
    """Generate hi-hat sound."""
    noise = np.random.randn(len(t_hit))
    noise = highpass_filter(noise, 6000, sample_rate)
    
    # Different decay for open vs closed
    decay = 3 if open_hat else 40
    envelope = np.exp(-decay * t_hit)
    
    return noise * envelope * 0.4


def generate_crash(t_hit, sample_rate):
    """Generate a crash cymbal."""
    noise = np.random.randn(len(t_hit))
    noise = highpass_filter(noise, 3000, sample_rate)
    
    # Long decay
    envelope = np.exp(-1.5 * t_hit)
    
    # Add some metallic tones
    metallic = np.sin(2 * np.pi * 4500 * t_hit) * 0.1
    metallic += np.sin(2 * np.pi * 6800 * t_hit) * 0.05
    
    return (noise + metallic) * envelope * 0.5


def generate_drum_track(t, sample_rate, bpm, duration):
    """Generate a full drum track with variation."""
    drums = np.zeros_like(t)
    
    beat_duration = 60.0 / bpm  # seconds per beat
    sixteenth = beat_duration / 4
    
    # Structure: intro (soft) -> build -> drop (full) -> breakdown -> final drop
    total_bars = int(duration / (beat_duration * 4))
    
    current_time = 0
    bar = 0
    
    while current_time < duration:
        # Determine intensity based on position
        progress = current_time / duration
        
        # Section detection
        if progress < 0.1:
            intensity = "intro"
        elif progress < 0.25:
            intensity = "build1"
        elif progress < 0.45:
            intensity = "drop1"
        elif progress < 0.55:
            intensity = "breakdown"
        elif progress < 0.7:
            intensity = "build2"
        else:
            intensity = "drop2"
        
        bar_in_section = bar % 4
        
        for beat in range(4):
            beat_time = current_time + beat * beat_duration
            
            if beat_time >= duration:
                break
            
            # KICK PATTERN
            kick_hits = []
            if intensity in ["drop1", "drop2"]:
                # Four-on-the-floor with variations
                kick_hits = [0]
                if beat % 2 == 1:
                    kick_hits.append(0.75 * beat_duration)  # Offbeat kick
                if bar_in_section == 3 and beat == 3:
                    kick_hits = [0, 0.25 * beat_duration, 0.5 * beat_duration]  # Fill
            elif intensity in ["build1", "build2"]:
                kick_hits = [0] if beat % 2 == 0 else []
                # Add more kicks as we progress through build
                if bar_in_section >= 2:
                    kick_hits = [0]
            elif intensity == "intro":
                kick_hits = [0] if beat == 0 else []
            
            for kick_offset in kick_hits:
                hit_time = beat_time + kick_offset
                start_idx = int(hit_time * sample_rate)
                hit_len = int(0.3 * sample_rate)
                end_idx = min(start_idx + hit_len, len(t))
                
                if start_idx < len(t) and end_idx > start_idx:
                    t_hit = np.linspace(0, (end_idx - start_idx) / sample_rate, end_idx - start_idx)
                    kick_vol = 1.0 if intensity in ["drop1", "drop2"] else 0.7
                    drums[start_idx:end_idx] += generate_kick(t_hit, sample_rate) * kick_vol
            
            # SNARE PATTERN
            snare_hits = []
            if intensity in ["drop1", "drop2", "build1", "build2"]:
                if beat in [1, 3]:
                    snare_hits = [0]
                # Snare rolls in builds
                if intensity in ["build1", "build2"] and bar_in_section == 3 and beat >= 2:
                    snare_hits = [0, sixteenth, 2*sixteenth, 3*sixteenth]
            
            for snare_offset in snare_hits:
                hit_time = beat_time + snare_offset
                start_idx = int(hit_time * sample_rate)
                hit_len = int(0.2 * sample_rate)
                end_idx = min(start_idx + hit_len, len(t))
                
                if start_idx < len(t) and end_idx > start_idx:
                    t_hit = np.linspace(0, (end_idx - start_idx) / sample_rate, end_idx - start_idx)
                    drums[start_idx:end_idx] += generate_snare(t_hit, sample_rate) * 0.8
            
            # HI-HAT PATTERN
            if intensity not in ["intro", "breakdown"]:
                for sixteenth_idx in range(4):
                    hat_time = beat_time + sixteenth_idx * sixteenth
                    start_idx = int(hat_time * sample_rate)
                    hit_len = int(0.1 * sample_rate)
                    end_idx = min(start_idx + hit_len, len(t))
                    
                    if start_idx < len(t) and end_idx > start_idx:
                        t_hit = np.linspace(0, (end_idx - start_idx) / sample_rate, end_idx - start_idx)
                        # Open hat on off-beats
                        is_open = (sixteenth_idx == 2)
                        hat_vol = 0.5 if sixteenth_idx % 2 == 0 else 0.3
                        drums[start_idx:end_idx] += generate_hihat(t_hit, sample_rate, is_open) * hat_vol
        
        # CRASH on section changes
        if bar_in_section == 0 and intensity in ["drop1", "drop2"]:
            start_idx = int(current_time * sample_rate)
            hit_len = int(1.5 * sample_rate)
            end_idx = min(start_idx + hit_len, len(t))
            
            if start_idx < len(t) and end_idx > start_idx:
                t_hit = np.linspace(0, (end_idx - start_idx) / sample_rate, end_idx - start_idx)
                drums[start_idx:end_idx] += generate_crash(t_hit, sample_rate)
        
        current_time += beat_duration * 4
        bar += 1
    
    return drums


def generate_bass_line(t, sample_rate, bpm, duration):
    """Generate a driving synth bass line."""
    bass = np.zeros_like(t)
    
    beat_duration = 60.0 / bpm
    eighth = beat_duration / 2
    
    # Bass notes (root notes of progression)
    # E minor progression: Em - C - G - D
    progression = [
        (82.41, 4),   # E2 for 4 beats
        (65.41, 4),   # C2 for 4 beats
        (98.00, 4),   # G2 for 4 beats
        (73.42, 4),   # D2 for 4 beats
    ]
    
    current_time = 0
    prog_idx = 0
    
    while current_time < duration:
        progress = current_time / duration
        
        # Section detection
        if progress < 0.1:
            intensity = "intro"
        elif progress < 0.25:
            intensity = "build1"
        elif progress < 0.45:
            intensity = "drop1"
        elif progress < 0.55:
            intensity = "breakdown"
        elif progress < 0.7:
            intensity = "build2"
        else:
            intensity = "drop2"
        
        base_freq, beats = progression[prog_idx % len(progression)]
        bar_duration = beats * beat_duration
        
        if intensity == "breakdown":
            # Sustained bass notes
            start_idx = int(current_time * sample_rate)
            end_idx = min(int((current_time + bar_duration) * sample_rate), len(t))
            
            if start_idx < len(t) and end_idx > start_idx:
                t_note = np.linspace(0, bar_duration, end_idx - start_idx)
                
                # Simple filtered saw bass
                phase = 2 * np.pi * base_freq * t_note
                note = np.sin(phase) + 0.3 * np.sin(2 * phase)
                
                # Soft envelope
                env = np.ones_like(t_note)
                fade = int(0.1 * sample_rate)
                env[:fade] = np.linspace(0, 1, fade)
                env[-fade:] = np.linspace(1, 0, fade)
                
                bass[start_idx:end_idx] += note * env * 0.4
        
        elif intensity in ["drop1", "drop2"]:
            # Pumping eighth-note bass
            for eighth_idx in range(int(beats * 2)):
                note_time = current_time + eighth_idx * eighth
                
                if note_time >= duration:
                    break
                
                start_idx = int(note_time * sample_rate)
                note_len = int(eighth * 0.8 * sample_rate)
                end_idx = min(start_idx + note_len, len(t))
                
                if start_idx < len(t) and end_idx > start_idx:
                    t_note = np.linspace(0, (end_idx - start_idx) / sample_rate, end_idx - start_idx)
                    
                    # Aggressive saw bass
                    phase = 2 * np.pi * base_freq * t_note
                    note = np.sin(phase)
                    note += 0.5 * np.sin(2 * phase)  # Octave
                    note += 0.3 * np.sin(3 * phase)  # Fifth
                    note += 0.2 * np.sin(4 * phase)  # 2nd octave
                    
                    # Punchy envelope
                    env = np.exp(-6 * t_note)
                    env = np.maximum(env, 0.3)  # Sustain floor
                    env[-int(0.02 * sample_rate):] *= np.linspace(1, 0, int(0.02 * sample_rate))
                    
                    # Pitch bend at start
                    pitch_mod = 1 + 0.5 * np.exp(-50 * t_note)
                    phase_mod = 2 * np.pi * base_freq * pitch_mod * t_note
                    note = np.sin(phase_mod)
                    note += 0.5 * np.sin(2 * phase_mod)
                    
                    bass[start_idx:end_idx] += note * env * 0.7
        
        elif intensity in ["build1", "build2"]:
            # Building bass - starts sparse, gets more intense
            build_progress = (current_time - duration * (0.1 if "1" in intensity else 0.55)) / (duration * 0.15)
            build_progress = np.clip(build_progress, 0, 1)
            
            notes_per_bar = int(2 + 6 * build_progress)  # 2 to 8 notes
            note_spacing = bar_duration / notes_per_bar
            
            for note_idx in range(notes_per_bar):
                note_time = current_time + note_idx * note_spacing
                
                if note_time >= duration:
                    break
                
                start_idx = int(note_time * sample_rate)
                note_len = int(note_spacing * 0.7 * sample_rate)
                end_idx = min(start_idx + note_len, len(t))
                
                if start_idx < len(t) and end_idx > start_idx:
                    t_note = np.linspace(0, (end_idx - start_idx) / sample_rate, end_idx - start_idx)
                    
                    phase = 2 * np.pi * base_freq * t_note
                    note = np.sin(phase) + 0.4 * np.sin(2 * phase)
                    
                    env = np.exp(-4 * t_note)
                    bass[start_idx:end_idx] += note * env * (0.4 + 0.3 * build_progress)
        
        current_time += bar_duration
        prog_idx += 1
    
    # Apply lowpass for warmth
    bass = lowpass_filter(bass, 400, sample_rate)
    
    return bass


def generate_sub_bass(t, sample_rate, bpm, duration):
    """Generate a deep sub bass following the kick."""
    sub = np.zeros_like(t)
    
    beat_duration = 60.0 / bpm
    
    # Sub bass notes following kick pattern
    progression = [82.41, 65.41, 98.00, 73.42]  # E2, C2, G2, D2 - one octave down
    
    current_time = 0
    prog_idx = 0
    
    while current_time < duration:
        progress = current_time / duration
        
        if progress < 0.25 or (progress > 0.45 and progress < 0.55):
            # Skip during intro and breakdown
            current_time += beat_duration * 4
            prog_idx += 1
            continue
        
        base_freq = progression[prog_idx % len(progression)] / 2  # One octave down
        
        # Sub hits on each beat
        for beat in range(4):
            hit_time = current_time + beat * beat_duration
            
            if hit_time >= duration:
                break
            
            start_idx = int(hit_time * sample_rate)
            hit_len = int(beat_duration * 0.9 * sample_rate)
            end_idx = min(start_idx + hit_len, len(t))
            
            if start_idx < len(t) and end_idx > start_idx:
                t_hit = np.linspace(0, (end_idx - start_idx) / sample_rate, end_idx - start_idx)
                
                # Pure sine sub bass
                sub_wave = np.sin(2 * np.pi * base_freq * t_hit)
                
                # Envelope following kick
                env = np.exp(-3 * t_hit)
                env = np.maximum(env, 0.2)
                
                sub[start_idx:end_idx] += sub_wave * env * 0.6
        
        current_time += beat_duration * 4
        prog_idx += 1
    
    return sub


def generate_lead_synth(t, sample_rate, bpm, duration):
    """Generate a dramatic lead synth melody."""
    lead = np.zeros_like(t)
    
    beat_duration = 60.0 / bpm
    
    # Dramatic melody phrases
    # Format: (freq, start_beat, duration_beats, velocity)
    melody_phrases = [
        # Drop 1 melody
        [(329.63, 0, 2, 0.8), (392.00, 2, 1, 0.7), (493.88, 3, 1, 0.9)],  # E4, G4, B4
        [(440.00, 0, 1.5, 0.8), (392.00, 1.5, 0.5, 0.6), (329.63, 2, 2, 0.9)],  # A4, G4, E4
        [(523.25, 0, 1, 0.9), (493.88, 1, 1, 0.8), (440.00, 2, 1, 0.7), (392.00, 3, 1, 0.8)],
        [(493.88, 0, 4, 1.0)],  # Sustained B4
    ]
    
    current_time = 0
    phrase_idx = 0
    
    while current_time < duration:
        progress = current_time / duration
        
        # Only play lead during drops
        if not (0.25 <= progress < 0.45 or progress >= 0.7):
            current_time += beat_duration * 4
            continue
        
        phrase = melody_phrases[phrase_idx % len(melody_phrases)]
        
        for freq, start_beat, dur_beats, velocity in phrase:
            note_time = current_time + start_beat * beat_duration
            note_duration = dur_beats * beat_duration
            
            if note_time >= duration:
                break
            
            start_idx = int(note_time * sample_rate)
            end_idx = min(int((note_time + note_duration) * sample_rate), len(t))
            
            if start_idx < len(t) and end_idx > start_idx:
                t_note = np.linspace(0, note_duration, end_idx - start_idx)
                
                # Detuned saw lead
                note = np.zeros(end_idx - start_idx)
                for detune in [-3, 0, 3]:
                    f = freq + detune
                    phase = 2 * np.pi * f * t_note
                    # Saw approximation
                    saw = np.sin(phase)
                    saw += 0.5 * np.sin(2 * phase)
                    saw += 0.33 * np.sin(3 * phase)
                    saw += 0.25 * np.sin(4 * phase)
                    note += saw * 0.33
                
                # ADSR envelope
                attack = 0.05
                decay = 0.1
                sustain = 0.7
                release = 0.15
                
                env = np.ones_like(t_note)
                
                attack_samples = int(attack * sample_rate)
                decay_samples = int(decay * sample_rate)
                release_samples = int(release * sample_rate)
                
                if attack_samples > 0 and attack_samples < len(env):
                    env[:attack_samples] = np.linspace(0, 1, attack_samples)
                
                decay_end = attack_samples + decay_samples
                if decay_samples > 0 and decay_end < len(env):
                    env[attack_samples:decay_end] = np.linspace(1, sustain, decay_samples)
                    env[decay_end:] = sustain
                
                if release_samples > 0 and release_samples < len(env):
                    env[-release_samples:] *= np.linspace(1, 0, release_samples)
                
                lead[start_idx:end_idx] += note * env * velocity * 0.25
        
        current_time += beat_duration * 4
        phrase_idx += 1
    
    return lead


def generate_riser(t, sample_rate, start_time, riser_duration):
    """Generate a dramatic riser/build-up effect."""
    riser = np.zeros_like(t)
    
    start_idx = int(start_time * sample_rate)
    end_idx = min(int((start_time + riser_duration) * sample_rate), len(t))
    
    if start_idx >= len(t) or end_idx <= start_idx:
        return riser
    
    t_riser = np.linspace(0, 1, end_idx - start_idx)
    
    # Noise sweep
    noise = np.random.randn(len(t_riser))
    
    # Filter sweep from low to high
    chunk_size = len(t_riser) // 20
    filtered_noise = np.zeros_like(noise)
    
    for i in range(20):
        start = i * chunk_size
        end = min((i + 1) * chunk_size, len(noise))
        cutoff = 200 + (10000 * (i / 20) ** 2)
        if end > start:
            chunk = noise[start:end]
            filtered_noise[start:end] = lowpass_filter(chunk, cutoff, sample_rate)
    
    # Volume crescendo
    volume = t_riser ** 2
    
    riser[start_idx:end_idx] = filtered_noise * volume * 0.4
    
    return riser


def generate_impact(t, sample_rate, impact_time):
    """Generate a massive impact/drop sound."""
    impact = np.zeros_like(t)
    
    start_idx = int(impact_time * sample_rate)
    impact_duration = 1.0
    end_idx = min(int((impact_time + impact_duration) * sample_rate), len(t))
    
    if start_idx >= len(t) or end_idx <= start_idx:
        return impact
    
    t_impact = np.linspace(0, impact_duration, end_idx - start_idx)
    
    # Deep boom with pitch drop
    freq = 80 * np.exp(-5 * t_impact) + 30
    phase = 2 * np.pi * np.cumsum(freq) / sample_rate
    boom = np.sin(phase)
    
    # Sub rumble
    rumble = np.sin(2 * np.pi * 25 * t_impact)
    
    # High frequency crack
    crack = np.random.randn(len(t_impact)) * np.exp(-30 * t_impact)
    
    # Combine
    imp_sound = boom * 0.7 + rumble * 0.4 + crack * 0.3
    imp_sound *= np.exp(-2 * t_impact)
    
    impact[start_idx:end_idx] = imp_sound
    
    return impact


def generate_scifi_soundtrack(
    duration: float = 60.0,
    sample_rate: int = 44100,
    bpm: float = 128.0,
    output_path: str = "scifi_soundtrack.wav"
):
    """
    Generate a dramatic sci-fi soundtrack with heavy drums and bass.
    
    Args:
        duration: Length of the track in seconds
        sample_rate: Audio sample rate
        bpm: Beats per minute
        output_path: Where to save the WAV file
    """
    print(f"Generating {duration}s dramatic sci-fi soundtrack at {bpm} BPM...")
    
    # Time array
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    
    # Generate all components
    print("  - Generating drum track...")
    drums = generate_drum_track(t, sample_rate, bpm, duration)
    
    print("  - Generating bass line...")
    bass = generate_bass_line(t, sample_rate, bpm, duration)
    
    print("  - Generating sub bass...")
    sub = generate_sub_bass(t, sample_rate, bpm, duration)
    
    print("  - Generating lead synth...")
    lead = generate_lead_synth(t, sample_rate, bpm, duration)
    
    print("  - Generating risers and impacts...")
    risers = np.zeros_like(t)
    impacts = np.zeros_like(t)
    
    # Add risers before drops
    riser_times = [
        (duration * 0.15, duration * 0.10),  # Before drop 1
        (duration * 0.60, duration * 0.10),  # Before drop 2
    ]
    for start, dur in riser_times:
        risers += generate_riser(t, sample_rate, start, dur)
    
    # Add impacts at drops
    impact_times = [duration * 0.25, duration * 0.70]
    for imp_time in impact_times:
        impacts += generate_impact(t, sample_rate, imp_time)
    
    # Mix all components
    print("  - Mixing...")
    mix = (
        drums * 0.5 +
        bass * 0.45 +
        sub * 0.5 +
        lead * 0.35 +
        risers * 0.4 +
        impacts * 0.6
    )
    
    # Sidechain compression simulation (duck other elements on kick)
    beat_duration = 60.0 / bpm
    sidechain = np.ones_like(t)
    
    current_time = 0
    while current_time < duration:
        progress = current_time / duration
        if 0.25 <= progress < 0.45 or progress >= 0.70:  # During drops
            for beat in range(4):
                beat_time = current_time + beat * beat_duration
                start_idx = int(beat_time * sample_rate)
                duck_samples = int(0.1 * sample_rate)
                end_idx = min(start_idx + duck_samples, len(t))
                
                if start_idx < len(t) and end_idx > start_idx:
                    duck = np.linspace(0.4, 1.0, end_idx - start_idx)
                    sidechain[start_idx:end_idx] = np.minimum(sidechain[start_idx:end_idx], duck)
        
        current_time += beat_duration * 4
    
    # Apply sidechain to non-drum elements
    bass *= sidechain
    lead *= sidechain
    
    # Remix with sidechain
    mix = (
        drums * 0.5 +
        bass * 0.45 +
        sub * 0.5 +
        lead * 0.35 +
        risers * 0.4 +
        impacts * 0.6
    )
    
    # Master compression (soft clipping)
    mix = np.tanh(mix * 1.2) * 0.85
    
    # Fade in and fade out
    fade_duration = 1.5
    fade_samples = int(fade_duration * sample_rate)
    
    fade_in = np.linspace(0, 1, fade_samples)
    fade_out = np.linspace(1, 0, fade_samples)
    
    mix[:fade_samples] *= fade_in
    mix[-fade_samples:] *= fade_out
    
    # Normalize to 16-bit range
    mix = mix / np.max(np.abs(mix))
    mix = (mix * 32767 * 0.95).astype(np.int16)
    
    # Save as WAV
    wavfile.write(output_path, sample_rate, mix)
    print(f"✓ Generated dramatic sci-fi soundtrack: {output_path}")
    print(f"  Structure: Intro → Build → DROP → Breakdown → Build → FINAL DROP")
    return output_path


if __name__ == "__main__":
    # Generate to the assets/sounds folder
    project_root = Path(__file__).parent.parent
    output = project_root / "assets" / "sounds" / "scifi-dramatic-soundtrack.wav"
    
    # Generate a 50-second dramatic track at 128 BPM
    generate_scifi_soundtrack(
        duration=50.0,
        bpm=128.0,
        output_path=str(output)
    )

