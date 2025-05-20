import React, { useState, useEffect, useRef } from 'react';
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
          setTimeout(() => setTela('resultado'), 500);
          return 0;
        }
        return anterior - 1;
      });
    }, 1000);
  };

  const aoClicarBotao = () => {
    const tempoReacao = Date.now() - inicioClique;
    const pontos = Math.max(0, Math.floor(1000 - tempoReacao));
    setPontuacao((anterior) => anterior + pontos);
    Vibration.vibrate(100);
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

  // Telas
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
      <View style={estilos.areaJogo}>
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
      </View>
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


