import React, { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native';
//importanto os sons
import somMP3 from './assets/button-3.mp3';
import somWav from './assets/goodresult.mp3';
//conexão com o banco de dados
import { database } from './firebaseconfig';
import { ref, push, query, limitToLast, orderByChild, get } from 'firebase/database';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Vibration,
  TextInput,
  FlatList,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [tela, setTela] = useState('menu');
  const [pontuacao, setPontuacao] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(30);
  const [posicaoBotao, setPosicaoBotao] = useState({ top: 100, left: 100 });
  const [botaoVisivel, setBotaoVisivel] = useState(false);
  const [inicioClique, setInicioClique] = useState(null);
  const [nomeJogador, setNomeJogador] = useState('');
  const [ranking, setRanking] = useState([]);
  const temporizadorJogo = useRef(null);
  const temporizadorBotao = useRef(null);
  const somClique = useRef(null);
  const somFim = useRef(null);
  const [somCarregado, setSomCarregado] = useState(false);
  const [somFimCarregado, setSomFimCarregado] = useState(false);

  useEffect(() => {
    const carregarSons = async () => {
      try {
        const { sound: click } = await Audio.Sound.createAsync(somMP3);
        somClique.current = click;
        setSomCarregado(true);

        const { sound: fim } = await Audio.Sound.createAsync(somWav);
        somFim.current = fim;
        setSomFimCarregado(true);
      } catch (e) {
        console.log('Erro ao carregar sons:', e);
      }
    };

    carregarSons();

    return () => {
      somClique.current?.unloadAsync();
      somFim.current?.unloadAsync();
    };
  }, []);

  const salvarNoRanking = async () => {
    const entrada = { nome: nomeJogador || 'Anônimo', pontuacao };
    try {
      await push(ref(database, 'ranking/'), entrada);
      setNomeJogador('');
      setTela('menu');
    } catch (e) {
      console.log('Erro ao salvar no Firebase:', e);
    }
  };

  useEffect(() => {
  const carregarRanking = async () => {
    try {
      const rankingRef = query(ref(database, 'ranking/'), orderByChild('pontuacao'), limitToLast(10));
      const snapshot = await get(rankingRef);
      if (snapshot.exists()) {
        const dados = Object.values(snapshot.val()).sort((a, b) => b.pontuacao - a.pontuacao);
        setRanking(dados);
      }
    } catch (e) {
      console.log('Erro ao carregar ranking do Firebase:', e);
    }
  };

  carregarRanking();
}, []);


  const iniciarJogo = () => {
    setPontuacao(0);
    setTempoRestante(30);
    setTela('jogo');
    mostrarNovoBotao();
    setInicioClique(Date.now());

    temporizadorJogo.current = setInterval(() => {
      setTempoRestante((anterior) => {
        if (anterior <= 1) {
          clearInterval(temporizadorJogo.current);
          clearTimeout(temporizadorBotao.current);
          setBotaoVisivel(false);
          Vibration.vibrate(500);
          if (somFimCarregado && somFim.current) {
            somFim.current.replayAsync().catch(() => {});
          }
          setTimeout(() => setTela('resultado'), 500);
          return 0;
        }
        return anterior - 1;
      });
    }, 1000);
  };

  const aoClicarBotao = async () => {
    const tempoReacao = Date.now() - inicioClique;
    const pontos = Math.max(0, Math.floor(1000 - tempoReacao));
    setPontuacao((anterior) => anterior + pontos);
    Vibration.vibrate(100);
    if (somCarregado && somClique.current) {
      await somClique.current.replayAsync().catch(() => {});
    }
    setBotaoVisivel(false);
    clearTimeout(temporizadorBotao.current);
    mostrarNovoBotao();
  };

  const mostrarNovoBotao = () => {
    const top = Math.random() * (height - 200);
    const left = Math.random() * (width - 150);
    setPosicaoBotao({ top, left });
    setBotaoVisivel(true);
    setInicioClique(Date.now());

    temporizadorBotao.current = setTimeout(() => {
      setBotaoVisivel(false);
      mostrarNovoBotao();
    }, 2000);
  };

  const BotaoMenu = ({ titulo, onPress }) => (
    <TouchableOpacity style={estilos.botaoMenu} onPress={onPress}>
      <Text style={estilos.textoBotao}>{titulo}</Text>
    </TouchableOpacity>
  );

  if (tela === 'menu') {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>⚡ ReflexMaster</Text>
        <BotaoMenu titulo="Jogar" onPress={iniciarJogo} />
        <BotaoMenu titulo="Como Jogar" onPress={() => setTela('instrucoes')} />
        <BotaoMenu titulo="Ranking" onPress={() => setTela('ranking')} />
        <BotaoMenu titulo="Sobre" onPress={() => setTela('sobre')} />
      </View>
    );
  }

  if (tela === 'resultado') {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>✅ Fim de Jogo</Text>
        <Text style={estilos.texto}>Sua pontuação: {pontuacao}</Text>
        <TextInput
          style={estilos.input}
          placeholder="Digite seu nome"
          value={nomeJogador}
          onChangeText={setNomeJogador}
        />
        <BotaoMenu titulo="Salvar no Ranking" onPress={salvarNoRanking} />
      </View>
    );
  }

  if (tela === 'ranking') {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>🏆 Ranking</Text>
        {ranking.length === 0 && <Text style={estilos.texto}>Nenhum registro ainda.</Text>}
        <FlatList
          data={ranking}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text style={estilos.texto}>
              {index + 1}. {item.nome} - {item.pontuacao} pts
            </Text>
          )}
        />
        <BotaoMenu titulo="Voltar" onPress={() => setTela('menu')} />
      </View>
    );
  }

  if (tela === 'jogo') {
    return (
      <SafeAreaView style={estilos.areaJogo}>
        <Text style={estilos.status}>⏱️ Tempo: {tempoRestante}s</Text>
        <Text style={estilos.status}>🎯 Pontos: {pontuacao}</Text>
        {botaoVisivel && (
          <TouchableOpacity
            style={[estilos.botaoJogo, { top: posicaoBotao.top, left: posicaoBotao.left }]}
            onPress={aoClicarBotao}
          >
            <Text style={{ fontSize: 24 }}>🎯</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  if (tela === 'instrucoes') {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>📘 Como Jogar</Text>
        <Text style={estilos.texto}>
          Toque no botão o mais rápido possível quando ele aparecer. Quanto mais rápido, mais pontos você ganha! O botão desaparece em 2 segundos!
        </Text>
        <BotaoMenu titulo="Voltar" onPress={() => setTela('menu')} />
      </View>
    );
  }

  if (tela === 'sobre') {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>👨‍💻 Sobre</Text>
        <Text style={estilos.texto}>Desenvolvido por Igor de Araujo Borges</Text>
        <Text style={estilos.texto}>RA: 22.223.006-2</Text>
        <Text style={estilos.texto}>Turma: 620 - Ciência da Computação</Text>
        <BotaoMenu titulo="Voltar" onPress={() => setTela('menu')} />
      </View>
    );
  }

  return null;
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#e0f7fa',
  },
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#00796B',
    textAlign: 'center',
  },
  texto: {
    fontSize: 18,
    marginVertical: 6,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  areaJogo: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  botaoJogo: {
    position: 'absolute',
    backgroundColor: '#81C784',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    fontSize: 18,
    margin: 10,
    textAlign: 'center',
    color: '#004D40',
  },
  botaoMenu: {
    backgroundColor: '#26A69A',
    padding: 14,
    borderRadius: 8,
    marginVertical: 6,
    width: '80%',
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
