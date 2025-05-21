import React, { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native';
import somMP3 from './assets/button-3.mp3';
import somWav from './assets/goodResult.wav';
import { ref, push, query, orderByChild, limitToLast, get } from 'firebase/database';
import { database } from './firebaseConfig';

import {
  View,
  Text,
  Button,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  TextInput,
  FlatList,
} from 'react-native';

const { width, height } = Dimensions.get('window');
export default function App() {

  const [tela, setTela] = useState('menu'); // menu, jogo, instrucoes, sobre, resultado, ranking
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
  const [somCarregado, setSomCarregado] = useState(false);
  
  


  useEffect(() => {
    const buscarRanking = async () => {
      try {
        const rankingRef = query(ref(database, 'ranking/'), orderByChild('pontuacao'), limitToLast(10));
        const snapshot = await get(rankingRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const lista = Object.values(data)
            .sort((a, b) => b.pontuacao - a.pontuacao);
          setRanking(lista);
        }
      } catch (error) {
        console.log('Erro ao buscar ranking:', error);
      }
    };

    buscarRanking();
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
      try {
        await somClique.current.replayAsync();
      } catch (e) {
        console.log('Erro ao reproduzir som:', e);
      }
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
  const salvarNoRanking = async () => {
    const entrada = { nome: nomeJogador || 'Anônimo', pontuacao };

    try {
      await push(ref(database, 'ranking/'), entrada);
      setNomeJogador('');
      setTela('menu');
    } catch (error) {
      console.log('Erro ao salvar no Firebase:', error);
    }
  };

  if (tela === 'menu') {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>⚡ ReflexMaster</Text>
        <Button title="Jogar" onPress={iniciarJogo} />
        <Button title="Como Jogar" onPress={() => setTela('instrucoes')} />
        <Button title="Ranking" onPress={() => setTela('ranking')} />
        <Button title="Sobre" onPress={() => setTela('sobre')} />
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
        <Button title="Salvar no Ranking" onPress={salvarNoRanking} />
      </View>
    );
  }

  if (tela === 'ranking') {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>🏆 Ranking</Text>
        {ranking.length === 0 && (
          <Text style={estilos.texto}>Nenhum registro ainda.</Text>
        )}
        <FlatList
          data={ranking}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text style={estilos.texto}>
              {index + 1}. {item.nome} - {item.pontuacao} pts
            </Text>
          )}
        />
        <Button title="Voltar" onPress={() => setTela('menu')} />
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
            style={[
              estilos.botaoJogo,
              { top: posicaoBotao.top, left: posicaoBotao.left },
            ]}
            onPress={aoClicarBotao}>
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
        <Button title="Voltar" onPress={() => setTela('menu')} />
      </View>
    );
  }

  if (tela === 'sobre') {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}> Sobre</Text>
        <Text style={estilos.texto}>Desenvolvido por Igor de Araujo Borges</Text>
        <Text style={estilos.texto}>RA: 22.223.006-2</Text>
        <Text style={estilos.texto}>Turma: 620 - Ciência da Computação</Text>
        <Button title="Voltar" onPress={() => setTela('menu')} />
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
    gap: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
  },
  texto: {
    fontSize: 18,
    marginVertical: 6,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 12,
    borderRadius: 6,
  },
   areaJogo: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  botaoJogo: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    fontSize: 18,
    margin: 10,
    textAlign: 'center',
  },
});


